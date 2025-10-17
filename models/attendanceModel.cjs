const mongoose = require("mongoose");

const attendanceModel = new mongoose.Schema({
    attendanceId: Number,
    classId: String,
    instructorId: String,
    date: Date,
    time: String,
    customers: [{
        customerId: String,
        firstName: String,
        lastName: String,
        classBalanceBefore: Number,
        classBalanceAfter: Number,
        hasNegativeBalance: Boolean
    }]
}, {collection: "attendance"});

module.exports = mongoose.model("Attendance", attendanceModel);
