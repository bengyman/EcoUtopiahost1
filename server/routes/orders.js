const express = require('express');
const router = express.Router();
const { Orders, Course } = require('../models');
const { Model } = require('sequelize');


router.post("/", async (req, res) => {
    let data = req.body;
    let result = await Orders.create(data);
    res.json(result);
});

router.get("/", async (req, res) => {
    let list = await Orders.findAll({
        include:
        {
            model: Course,
        },
        order: [['order_id', 'ASC']]
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let result = await Orders.findByPk(id, {
        include: {
            model: Course,
        }
    });
    res.json(result);
});

router.put("/:id", async (req, res) => {
    let id = req.params.id;
    let order = await Orders.findByPk(id);
    if (order) {
        order.order_status = 'Refunded';
        await order.save();
        let updatedOrder = await Orders.findByPk(id, {
            include: {
                model: Course,
            }
        });
        res.json(updatedOrder);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

router.post("/addCourse", async (req, res) => {
    try {
        const { course_id } = req.body;
        const order = await Orders.create({
            course_id,
            resident_id: 1, // Set userid to the currently logged in user
            order_date: new Date(), // Set order_date to current date/time
            order_status: 'Upcoming' // Set order_status to default value
        });
        res.status(201).json(order);
    } catch (error) {
        console.error("Error adding course to orders:", error);
        res.status(500).json({ error: 'Failed to add course to orders' });
    }
});


module.exports = router;