const express = require('express');
const router = express.Router();
const { Orders, Course, Resident } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.post("/", authenticateToken, async (req, res) => {
  let data = req.body;
  let result = await Orders.create(data);
  res.json(result);
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    let list;
    if (req.user.role === 'STAFF') {
      list = await Orders.findAll({
        include: {
          model: Course,
        },
        order: [['order_id', 'ASC']]
      });
    } else if (req.user.role === 'RESIDENT') {
      const resident = await Resident.findOne({ where: { user_id: req.user.id } });
      if (!resident) {
        return res.status(404).json({ error: 'Resident details not found' });
      }
      list = await Orders.findAll({
        where: {
          resident_id: resident.resident_id
        },
        include: {
          model: Course,
        },
        order: [['order_id', 'ASC']]
      });
    } else {
      return res.status(403).json({ message: 'Access denied.' });
    }
    res.json(list);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    let id = req.params.id;
    let result = await Orders.findByPk(id, {
      include: {
        model: Course,
      }
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
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

router.post("/addCourse", authenticateToken, async (req, res) => {
  try {
    const { course_id } = req.body;
    const resident = await Resident.findOne({ where: { user_id: req.user.id } });
    if (!resident) {
      return res.status(404).json({ error: 'Resident details not found' });
    }
    const order = await Orders.create({
      course_id,
      resident_id: resident.resident_id,
      order_date: new Date(),
      order_status: 'Upcoming'
    });
    res.status(201).json(order);
  } catch (error) {
    console.error("Error adding course to orders:", error);
    res.status(500).json({ error: 'Failed to add course to orders' });
  }
});

module.exports = router;
