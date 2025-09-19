const mongoose = require("mongoose");

const instructorModel = new mongoose.Schema({
    instructorId: String,
    firstname: String,
    lastname: String,
    email: String,
    phone: String,
    address: String,
    preferredContact: String
}, {collection:"instructor"});

module.exports = mongoose.model("Instructor", instructorModel);