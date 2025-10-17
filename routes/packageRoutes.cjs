const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController.cjs");

router.get("/getAll", packageController.getAllPackages);
router.post("/add", packageController.addPackage);

module.exports = router;