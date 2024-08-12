const express = require("express");
const yup = require("yup");
const { Course, Orders, Sequelize } = require("../models");
const uploadFile = require('../middleware/uploadfile');
const router = express.Router();

const courseSchema = yup.object().shape({
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
  course_image_url: yup
    .string()
    .required("Image URL is required"),
});

router.post("/create-course", uploadFile.single('course_image_url'), async (req, res) => {
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
      course_image_url,
    } = req.body;

    let data = {};
    
    if (req.file) {
      data.image = req.file.location;
    }
    
    await courseSchema.validate({
      course_name,
      course_description,
      course_instructor,
      course_price,
      course_type,
      course_date,
      course_start_time,
      course_end_time,
      course_capacity,
      course_image_url: data.image,
    });

    console.log(`image url: ${data.image}`);

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
      course_image_url: data.image,
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

router.put("/update-course/:id", uploadFile.single('course_image_url'), async (req, res) => {
  try {
    console.log(`Request file: ${JSON.stringify(req.file)}`);
    console.log(`Location: ${req.file.location}`);
    console.log(`Request body: ${req.body}`);
    console.log(`Request params: ${req.params}`);
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
      course_image_url,
    } = req.body;

    let data = {};
    
    if (req.file) {
      data.image = req.file.location;
    }
    
    await courseSchema.validate({
      course_name,
      course_description,
      course_instructor,
      course_price,
      course_type,
      course_date,
      course_start_time,
      course_end_time,
      course_capacity,
      course_image_url: data.image
    });

    console.log(`image url: ${data.image}`);

    const courseUpdated = await Course.update({
      course_name,
      course_description,
      course_instructor,
      course_price,
      course_type,
      course_date,
      course_start_time,
      course_end_time,
      course_capacity,
      course_image_url: data.image,
    }, {
      where: {
        id: req.params.id
      }
    });
    res.status(200).json(courseUpdated);
  
    /*await course.update({
      course_name,
      course_description,
      course_instructor,
      course_price,
      course_type,
      course_date,
      course_start_time,
      course_end_time,
      course_capacity,
      course_image_url: data.image,
    });

    res.status(200).json(course);*/
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
    await Orders.destroy({ where: { course_id: req.params.id } });
    await course.destroy();
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
});

module.exports = router;
