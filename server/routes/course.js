const express = require("express");
const yup = require("yup");
const { Course, Orders, Instructor, Sequelize } = require("../models");
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
  course_start_date: yup
    .date()
    .required("Course start date is required"),
  course_end_date: yup
    .date()
    .required("Course end date is required")
    .test(
      "end-time-after-start-time",
      "End time must be after start time",
      function (value) {
        const startTime = new Date(this.parent.course_start_date);
        const endTime = new Date(value);
        return endTime > startTime;
      }
    ),
  course_capacity: yup
    .number()
    .required("Course capacity is required")
    .integer("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1"),
  course_image_url: yup.string().required("Image URL is required"),
});

router.post("/create-course", uploadFile.single('course_image_url'), async (req, res) => {
  try {
    const {
      course_name,
      course_description,
      course_instructor,  // This is the instructor's name
      course_price,
      course_type,
      course_start_date,
      course_end_date,
      course_capacity,
    } = req.body;

    const course_image_url = req.file ? req.file.location : null;

    // Find the instructor ID based on the name
    const instructor = await Instructor.findOne({ where: { name: course_instructor } });
    if (!instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    await courseSchema.validate({
      course_name,
      course_description,
      course_instructor,
      course_price,
      course_type,
      course_start_date,
      course_end_date,
      course_capacity,
      course_image_url,
    });

    const course = await Course.create({
      course_name,
      course_description,
      instructorid: instructor.instructorid,  // Use the found instructor ID
      course_price,
      course_type,
      course_start_date,
      course_end_date,
      course_capacity,
      course_image_url,
    });

    res.status(201).json(course);
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(400).json({ errors: error.message });
  }
});

router.get('/publishedCourses', async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{
        model: Instructor,
        attributes: ['name', 'profile_pic'],   // Include the instructor's name
      }],
      where: {
        course_status: 'published'
      }
    });
    res.json(courses);
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
});

router.get("/getCourses", async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{
        model: Instructor,
        attributes: ['name'],  // Include the instructor's name
      }],
    })
    res.json(courses);
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
});

router.get("/getInstructorCourses", async (req, res) => {
  try {
    const instructorId = req.query.instructorId; // Get the instructor ID from the query parameter
    const courses = await Course.findAll({
      where: { instructorid: instructorId },
      include: [{
        model: Instructor,
        attributes: ['name'],  // Include the instructor's name
      }],
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/getCourse/:id", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{
        model: Instructor,
        attributes: ['name', 'profile_pic']  // Include the instructor's name
      }],
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({
      ...course.toJSON(),
      course_instructor: course.Instructor.name,  // Add instructor's name to the response
    });
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
});


router.put("/update-course/:id", uploadFile.single('course_image_url'), async (req, res) => {
  try {
    const {
      course_name,
      course_description,
      course_instructor,  // This is the instructor's name
      course_price,
      course_type,
      course_start_date,
      course_end_date,
      course_capacity,
    } = req.body;

    const course_image_url = req.file ? req.file.location : null;

    // Find the existing course by ID
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find the instructor ID based on the name
    const instructor = await Instructor.findOne({ where: { name: course_instructor } });
    if (!instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    // Validate the input data
    await courseSchema.validate({
      course_name,
      course_description,
      course_instructor,
      course_price,
      course_type,
      course_start_date,
      course_end_date,
      course_capacity,
      course_image_url,
    });

    // Update the course with the validated data
    await course.update({
      course_name,
      course_description,
      instructorid: instructor.instructorid,  // Use the found instructor ID
      course_price,
      course_type,
      course_start_date,
      course_end_date,
      course_capacity,
      course_image_url: course_image_url || course.course_image_url,  // Keep the old image URL if no new image is uploaded
    });

    res.status(200).json(course);

  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
});


router.patch("/publishCourse/:id", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    await course.update({
      //course_status: req.body.course_status,
      course_status: 'published'
    });
    res.json(course);
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
})

router.patch("/assignInstructor/:courseId", async (req, res) => {
  const { instructorId } = req.body;
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    const instructor = await Instructor.findByPk(instructorId);
    if (!instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }
    course.instructorid = instructorId;
    await course.save();
    res.status(200).json({ message: "Instructor assigned successfully" });
  } catch (error) {
    console.error("Error assigning instructor:", error);
    res.status(400).json({ error: error.errors });
  }
})

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