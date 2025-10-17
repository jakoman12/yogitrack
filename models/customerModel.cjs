const mongoose = require("mongoose");

const customerModel = new mongoose.Schema({
    customerId: String,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    preferredContact: {type: String, enum: ["phone", "email"]},
    classBalance: {type: Number, default: 0}
}, {collection: "customer"});

module.exports = mongoose.model("Customer", customerModel);
