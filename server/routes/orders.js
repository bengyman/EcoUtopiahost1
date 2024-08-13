const express = require('express');
const router = express.Router();
const { Orders, Course, Resident, Instructor } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Make sure to set your Stripe secret key in your environment variables

router.post("/", authenticateToken, async (req, res) => {
  try {
    let data = req.body;
    let result = await Orders.create(data);
    res.json(result);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Fetch all orders with associated Resident and Course details
router.get("/", authenticateToken, authorizeRoles('STAFF', 'RESIDENT'), async (req, res) => {
  try {
    let list;
    if (req.user.role === 'STAFF') {
      list = await Orders.findAll({
        include: [
          {
            model: Course,
          },
          {
            model: Resident,
            attributes: ['name']  // Fetch only the name of the resident
          }
        ],
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
        include: [
          {
            model: Course,
          },
          {
            model: Resident,
            attributes: ['name']  // Fetch only the name of the resident
          }
        ],
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

// Fetch a specific order with associated Resident and Course details
router.get("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let result = await Orders.findByPk(id, {
      include: [
        {
          model: Course,
          include: {
            model: Instructor, // Ensure the Instructor model is included
            attributes: ['name'] // Fetch only the name attribute
          }
        },
        {
          model: Resident,
          attributes: ['name']
        }
      ]
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
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


router.put("/refund/:id", authenticateToken, authorizeRoles('RESIDENT'), async (req, res) => {
  let id = req.params.id;
  let order = await Orders.findByPk(id);
  if (order) {
    order.order_status = 'Pending';
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

router.put("/approveRefund/:id", authenticateToken, authorizeRoles('STAFF'), async (req, res) => {
  let id = req.params.id;
  let order = await Orders.findByPk(id);

  if (order && order.order_status === 'Pending') {
    try {
      // Fetch the Stripe PaymentIntent ID from your database
      const paymentIntentId = order.payment_intent;

      // Process the refund with Stripe
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer',
      });

      // Update the order status
      order.order_status = 'Refunded';
      await order.save();

      let updatedOrder = await Orders.findByPk(id, {
        include: {
          model: Course,
        }
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error processing refund with Stripe:', error);
      res.status(500).json({ error: 'Failed to process refund with Stripe' });
    }
  } else {
    res.status(404).json({ error: 'Order not found or not in pending status' });
  }
});

module.exports = router;
