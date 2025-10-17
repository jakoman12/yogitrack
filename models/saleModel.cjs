const mongoose = require("mongoose");

const saleModel = new mongoose.Schema({
    saleId: Number,
    customerId: String,
    packageId: String,
    amountPaid: Number,
    modeOfPayment: {type: String, enum: ["cash", "card", "online"]},
    paymentDateTime: Date,
    validityStartDate: Date,
    validityEndDate: Date
}, {collection: "sale"});

module.exports = mongoose.model("Sale", saleModel);
