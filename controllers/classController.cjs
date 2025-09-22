const Class = require("../models/classModel.cjs");

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addClass = async (req, res) => {
  try {
    const { className, instructorId, classType, description, daytime } = req.body;

    if (!className || !instructorId || !classType || !daytime || !daytime.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Pull first entry for conflict check
    const { day, time } = daytime[0];

    const conflict = await Class.findOne({ "daytime.day": day, "daytime.time": time });
    if (conflict) {
      return res.status(409).json({
        message: `Conflict: another class already scheduled on ${day} at ${time}`
      });
    }

    // Generate classId automatically
    const lastClass = await Class.findOne().sort({ classId: -1 });
    let nextId = "A001";
    if (lastClass && lastClass.classId) {
      const match = lastClass.classId.match(/\d+$/);
      if (match) nextId = `A${String(parseInt(match[0]) + 1).padStart(3, "0")}`;
    }

    const newClass = new Class({
      classId: nextId,
      className,
      instructorId,
      classType,
      description,
      daytime
    });

    await newClass.save();
    res.status(201).json({ message: "Class added successfully", class: newClass });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
