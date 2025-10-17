const express = require("express");
const router = express.Router();
const saleController = require("../controllers/saleController.cjs");

router.get("/getAll", saleController.getAllSales);
router.post("/record", saleController.recordSale);

module.exports = router;
