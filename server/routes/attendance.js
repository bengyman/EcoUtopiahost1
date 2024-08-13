const express = require('express');
const router = express.Router();
const { Attendance, Resident } = require('../models');

router.get('/getAttendance/:courseId' , async (req, res) => {
  try {
    const { courseId } = req.params;
    const attendanceRecords = await Attendance.findAll({
      where: { course_id: courseId },
      include: [{ model: Resident, attributes: ['name'] }],
    });
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/attendance', async (req, res) => {
  try {
    const { courseId, attendanceRecords } = req.body;
    await Promise.all(attendanceRecords.map(async record => {
      await Attendance.create({
        course_id: courseId,
        resident_id: record.studentId,
        attendance_status: record.status,
        attendance_date: record.attendance_date,
      });
    }));
    res.status(201).json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;