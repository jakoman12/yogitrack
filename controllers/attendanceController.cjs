const Attendance = require("../models/attendanceModel.cjs");
const Customer = require("../models/customerModel.cjs");
const Class = require("../models/classModel.cjs");

exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function nextAttendanceId() {
    const last = await Attendance.find()
    .sort({attendanceId: -1})
    .limit(1);
    if (!last.length) return 1001;
    return last[0].attendanceId + 1;
}

exports.getInstructorClasses = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const classes = await Class.find({ instructorId });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.recordAttendance = async (req, res) => {
  try {
    const { classId, instructorId, date, time, customerIds, allowNegativeBalance } = req.body;

    if (!classId || !instructorId || !date || !time || !customerIds || !Array.isArray(customerIds)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const classInfo = await Class.findOne({ classId });
    if (!classInfo) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classInfo.instructorId !== instructorId) {
      return res.status(403).json({ message: "This class is not assigned to this instructor" });
    }

    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const dayOfWeek = attendanceDate.toLocaleDateString('en-US', { weekday: 'short' });
    let scheduleWarning = null;
    if (classInfo.day && dayOfWeek !== classInfo.day) {
      scheduleWarning = `Warning: Attendance date (${dayOfWeek}) does not match class schedule (${classInfo.day})`;
    }
    if (classInfo.time && time !== classInfo.time) {
      const timeWarning = `Warning: Attendance time (${time}) does not match class schedule (${classInfo.time})`;
      scheduleWarning = scheduleWarning ? `${scheduleWarning}. ${timeWarning}` : timeWarning;
    }

    const customersData = [];
    const insufficientBalanceCustomers = [];

    for (const customerId of customerIds) {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        return res.status(404).json({ message: `Customer ${customerId} not found` });
      }

      const classBalanceBefore = customer.classBalance || 0;
      const classBalanceAfter = classBalanceBefore - 1;
      const hasNegativeBalance = classBalanceAfter < 0;

      if (hasNegativeBalance && !allowNegativeBalance) {
        insufficientBalanceCustomers.push({
          customerId: customer.customerId,
          name: `${customer.firstName} ${customer.lastName}`,
          currentBalance: classBalanceBefore
        });
      }

      customersData.push({
        customerId: customer.customerId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        classBalanceBefore,
        classBalanceAfter,
        hasNegativeBalance
      });
    }

    if (insufficientBalanceCustomers.length > 0) {
      return res.status(409).json({
        message: "Some customers have insufficient class balance",
        insufficientBalanceCustomers,
        requiresConfirmation: true
      });
    }

    const attendanceId = await nextAttendanceId();

    const newAttendance = new Attendance({
      attendanceId,
      classId,
      instructorId,
      date: attendanceDate,
      time,
      customers: customersData
    });

    await newAttendance.save();

    for (const customerData of customersData) {
      await Customer.updateOne(
        { customerId: customerData.customerId },
        { $set: { classBalance: customerData.classBalanceAfter } }
      );
    }

    const confirmations = customersData.map(c => ({
      customerId: c.customerId,
      name: `${c.firstName} ${c.lastName}`,
      message: `Hello ${c.firstName}! You are checked-in for a class on ${attendanceDate.toLocaleDateString()} at ${time}. Your class-balance is ${c.classBalanceAfter}.`
    }));

    res.status(201).json({
      message: "Attendance recorded successfully",
      attendance: newAttendance,
      scheduleWarning,
      confirmations
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to record attendance", error: err.message });
  }
};
