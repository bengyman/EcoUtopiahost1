const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const { Orders, Resident } = require('../models');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

router.post('/create-checkout-session', authenticateToken, async (req, res) => {
    const { items, course_id } = req.body;
    const resident = await Resident.findOne({ where: { user_id: req.user.id } });

    if (!resident) {
        return res.status(404).json({ error: 'Resident details not found' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map((item) => ({
                price_data: {
                    currency: 'sgd',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: item.price * 1,
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/orders`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: {
                resident_id: resident.resident_id,
                course_id: course_id,
            },
        });
        

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stripe requires the raw body to validate the webhook signature
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.sendStatus(400);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Extract metadata from the session
        const resident_id = session.metadata.resident_id;
        const course_id = session.metadata.course_id;

        try {
            // Save order details to the database
            await Orders.create({
                course_id,
                resident_id,
                order_date: new Date(),
                order_status: 'Upcoming'
            });

            res.sendStatus(200);
        } catch (err) {
            console.error('Error adding course to orders:', err.message);
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(400);
    }
});



module.exports = router;
