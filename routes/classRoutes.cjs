const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController.cjs");

router.get("/addClass", classController.addClass);
// router.get("/getNextId", instructorController.getNextId);
// router.post("/add", instructorController.add);
// router.get("/getInstructorIds", instructorController.getInstructorIds);
// router.delete("/deleteInstructor", instructorController.deleteInstructor);

module.exports = router;