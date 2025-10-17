const mongoose = require("mongoose");

const packageModel = new mongoose.Schema({
    packageId: String,
    packageName: String,
    category: String,
    numberOfClasses: {type: String, enum: ["1", "4", "10", "unlimited"]},
    classType: {type: String, enum: ["General", "Special"]},
    startDate: Date,
    endDate: Date,
    description: String,
    price: Number
}, {collection: "package"});

module.exports = mongoose.model("Package", packageModel);
