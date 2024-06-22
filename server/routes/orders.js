const express = require('express');
const router = express.Router();
const { Orders, Course } = require('../models');

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


module.exports = router;