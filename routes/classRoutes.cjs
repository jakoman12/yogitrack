const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController.cjs");

router.post("/add", classController.addClass);
router.get("/getAllClasses", classController.getAllClasses);
// router.get("/getNextId", instructorController.getNextId);
// router.post("/add", instructorController.add);
// router.get("/getInstructorIds", instructorController.getInstructorIds);
// router.delete("/deleteInstructor", instructorController.deleteInstructor);

module.exports = router;