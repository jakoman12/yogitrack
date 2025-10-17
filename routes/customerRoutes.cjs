const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController.cjs");

router.get("/getAll", customerController.getAllCustomers);
router.post("/add", customerController.addCustomer);

module.exports = router;
