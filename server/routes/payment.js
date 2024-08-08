// payment.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const { Orders, Resident } = require('../models');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

router.post('/create-checkout-session', authenticateToken, async (req, res) => {
    const { items, course_id, cancel_url } = req.body;
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
                    unit_amount: item.price,
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancel_url,
            metadata: {
                resident_id: resident.resident_id,
                course_id: course_id,
            },
        });

        res.json({ id: session.id, payment_intent: session.payment_intent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/process-order', async (req, res) => {
    const { sessionId } = req.body;

    console.log('Received request to process order with sessionId:', sessionId);

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const { resident_id, course_id } = session.metadata;

            await Orders.create({
                course_id,
                resident_id,
                order_date: new Date(),
                order_status: 'Upcoming',
                payment_intent: session.payment_intent, // Store the payment_intent
            });

            res.sendStatus(200);
        } else {
            res.status(400).json({ error: 'Payment not completed' });
        }
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ error: 'Failed to process order' });
    }
});


module.exports = router;
