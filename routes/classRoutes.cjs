const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController.cjs");

router.post("/add", classController.addClass);
router.get("/getAllClasses", classController.getAllClasses);
// TODO delete/modify class

module.exports = router;