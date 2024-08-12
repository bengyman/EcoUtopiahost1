const express = require("express");
const yup = require("yup");
const { Course, Instructor, Sequelize } = require("../models");
const uploadFile = require('../middleware/uploadfile');
const router = express.Router();

router.get("/getInstructors", async (req, res) => {
  try {
    const instructors = await Instructor.findAll();
    res.json(instructors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getCourses/:instructorId", async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { instructorid: req.params.instructorId },
    });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;