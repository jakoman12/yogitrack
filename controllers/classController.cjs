const Class = require("../models/classModel.cjs");

exports.addClass = async (req, res) => {
    try{
        const { classId, instructorId, day, time, classType, payRate } = req.body;

        if (!classId || !instructorId || !day || !time || !classType || !payRate) {
        return res.status(400).json({ message: "Missing required fields" });
        }

        // Check for schedule conflict
        const conflict = await Class.findOne({ day, time });
        if (conflict) {
        return res.status(409).json({
            message: `Conflict: another class already scheduled on ${day} at ${time}`
        });
        }

        const newClass = new Class({ classId, instructorId, day, time, classType, payRate });
        await newClass.save();

        res.status(201).json({ message: "Class added successfully", class: newClass });
    } catch(err){
        res.status(500).json({ error: err.message });
    }
};