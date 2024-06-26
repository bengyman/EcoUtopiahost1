const express = require("express");
const yup = require("yup");
const { Course, Sequelize } = require("../models");
const router = express.Router();

router.post("/createCourse", async (req, res) => {
  const schema = yup.object().shape({
    course_name: yup.string().required("Course name is required"),
    course_description: yup.string().required("Course description is required"),
    course_instructor: yup.string().required("Instructor name is required"),
    course_price: yup.number().required("Price is required"),
    course_type: yup
      .string()
      .required("Course type is required")
      .oneOf(
        ["Online", "Physical"],
        'Course type must be either "Online" or "Physical"'
      ), // "Online" or "Physical"
    course_date: yup
      .date()
      .required("Course date is required")
      .min(new Date(), "Course date cannot be in the past") // Ensure the date is not in the past
      .typeError("Invalid date format. Please use YYYY-MM-DD."),
    course_start_time: yup
      .string() // "HH:MM:SS"
      .required("Course start time is required")
      .matches(
        /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format. Please use HH:MM (24-hour format)."
      ),
    course_end_time: yup
      .string()
      .required("Course end time is required")
      .test(
        "end-time-after-start-time",
        "End time must be after start time",
        function (value) {
          const startTime = this.parent.course_start_time;
          if (!startTime || !value) return true; // Allow if either time is missing
          return (
            new Date(`2000-01-01 ${value}`) >
            new Date(`2000-01-01 ${startTime}`)
          );
        }
      )
      .matches(
        /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format. Please use HH:MM (24-hour format)."
      ), // "HH:MM:SS"
    course_capacity: yup
      .number()
      .required("Course capacity is required")
      .integer("Capacity must be a whole number")
      .min(1, "Capacity must be at least 1"),
  });

  try {
    const {
      course_name,
      course_description,
      course_instructor,
      course_price,
      course_type,
      course_date,
      course_start_time,
      course_end_time,
      course_capacity,
    } = await schema.validate(req.body, { abortEarly: false });
    const course = await Course.create({
      course_name,
      course_description,
      course_instructor,
      course_price,
      course_type,
      course_date,
      course_start_time,
      course_end_time,
      course_capacity,
    });
    res.status(201).json(course);
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: error.errors });
  }
});

router.get("/getCourses", async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
});

router.get("/getCourse/:id", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
})

router.put("/updateCourse/:id", async (req, res) => {
  const schema = yup.object().shape({
    course_name: yup.string().required("Course name is required"),
    course_description: yup.string().required("Course description is required"),
    course_instructor: yup.string().required("Instructor name is required"),
    course_price: yup.number().required("Price is required"),
    course_type: yup
      .string()
      .required("Course type is required")
      .oneOf(
        ["Online", "Physical"],
        'Course type must be either "Online" or "Physical"'
      ), // "Online" or "Physical"
    course_date: yup
      .date()
      .required("Course date is required")
      .min(new Date(), "Course date cannot be in the past") // Ensure the date is not in the past
      .typeError("Invalid date format. Please use YYYY-MM-DD."),
    course_start_time: yup
      .string() // "HH:MM:SS"
      .required("Course start time is required")
      .matches(
        /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format. Please use HH:MM (24-hour format)."
      ),
    course_end_time: yup
      .string()
      .required("Course end time is required")
      .test(
        "end-time-after-start-time",
        "End time must be after start time",
        function (value) {
          const startTime = this.parent.course_start_time;
          if (!startTime || !value) return true; // Allow if either time is missing
          return (
            new Date(`2000-01-01 ${value}`) >
            new Date(`2000-01-01 ${startTime}`)
          );
        }
      )
      .matches(
        /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format. Please use HH:MM (24-hour format)."
      ), // "HH:MM:SS"
    course_capacity: yup
      .number()
      .required("Course capacity is required")
      .integer("Capacity must be a whole number")
      .min(1, "Capacity must be at least 1"),
    });
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    const {
      course_name,
      course_description,
      course_instructor,
      course_price,
      course_type,
      course_date,
      course_start_time,
      course_end_time,
      course_capacity,
    } = await schema.validate(req.body, { abortEarly: false });
    await course.update({
      course_name,
      course_description,
      course_instructor,
      course_price,
      course_type,
      course_date,
      course_start_time,
      course_end_time,
      course_capacity,
    });
    res.json(course);
  }
  catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: error.errors });
  }
});

router.delete("/deleteCourse/:id", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    await course.destroy();
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
});

module.exports = router;
