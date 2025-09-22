const mongoose = require("mongoose");

const classModel = new mongoose.Schema({
    classId: String,
    className: String,
    instructorId: String,
    classType: String,
    description: String,
    daytime: [
        {
            day: String,
            time: String,
            duration: Number
        }
    ]
}, {collection: "class"});

module.exports = mongoose.model("Class", classModel);