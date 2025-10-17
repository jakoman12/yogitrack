const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController.cjs");

router.get("/getAll", attendanceController.getAllAttendance);
router.get("/instructor/:instructorId/classes", attendanceController.getInstructorClasses);
router.post("/record", attendanceController.recordAttendance);

module.exports = router;
