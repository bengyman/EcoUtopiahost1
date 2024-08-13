// payment.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const { Orders, Resident, Attendance, RedeemReward, Course } = require('../models');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  const { items, course_id, cancel_url, voucherCode } = req.body;
  const resident = await Resident.findOne({ where: { user_id: req.user.id } });

  if (!resident) {
      return res.status(404).json({ error: 'Resident details not found' });
  }

  try {
      const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card', 'alipay', 'paynow'],
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
              voucherCode: voucherCode, // Add voucherCode to the metadata
          },
      });

      res.json({ id: session.id, payment_intent: session.payment_intent });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

router.post('/process-order', async (req, res) => {
    const { sessionId } = req.body;
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        const { resident_id, course_id, voucherCode } = session.metadata;
  
        const existingOrder = await Orders.findOne({
          where: {
            course_id,
            resident_id,
            payment_intent: session.payment_intent,
          },
        });
  
        if (existingOrder) {
          return res.status(200).json({ message: 'Order already exists' });
        }
  
        await Orders.create({
          course_id,
          resident_id,
          order_date: new Date(),
          order_status: 'Upcoming',
          payment_intent: session.payment_intent,
        });
  
        await Attendance.create({
          course_id,
          resident_id,
          attendance_date: new Date(),
          attendance_status: 'enrolled',
        });
  
        const amountPaid = session.amount_total / 100; // Convert amount from cents to dollars
        const ecoPointsEarned = Math.floor(amountPaid * 10); // 10x the price paid, rounded down
  
        const resident = await Resident.findOne({ where: { resident_id } });
        if (resident) {
          await resident.update({
            ecoPoints: resident.ecoPoints + ecoPointsEarned
          });
        }
  
        // Return the new ecoPoints value
        res.status(200).json({ ecoPoints: resident.ecoPoints });
  
        // Update RedeemReward entry if voucherCode is used
        if (voucherCode) {
          const redeemReward = await RedeemReward.findOne({
            where: {
              resident_id,
              reward_used: false,
              voucher_code: voucherCode,
            },
          });
  
          if (redeemReward) {
            await redeemReward.update({
              reward_used: true,
              reward_used_at: new Date(),
            });
          }
        }
      } else {
        res.status(400).json({ error: 'Payment not completed' });
      }
    } catch (error) {
      console.error('Error processing order:', error);
      res.status(500).json({ error: 'Failed to process order' });
    }
});
  

  
module.exports = router;
