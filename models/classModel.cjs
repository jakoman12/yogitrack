const mongoose = require("mongoose");

const classModel = new mongoose.Schema({
    classId: String,
    className: String,
    instructorId: String,
    classType: String,
    description: String
}, {collection: "class"});

module.exports = mongoose.model("Class", classModel);