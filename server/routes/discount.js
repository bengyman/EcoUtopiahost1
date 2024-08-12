const express = require('express');
const { RedeemReward, Rewards } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { discountCode, residentId } = req.body; // Ensure residentId is retrieved from the request body
    const reward = await RedeemReward.findOne({
      where: {
        voucher_code: discountCode,
        resident_id: residentId, // Use residentId from the request body
        reward_used: false, // Ensure the voucher hasn't been used
      },
      include: [
        {
          model: Rewards,
          as: 'Reward',
          attributes: ['reward_type', 'reward_value'],
        },
      ],
    });

    if (!reward) {
      return res.status(404).json({ error: 'Invalid or expired discount code.' });
    }

    const { reward_type, reward_value } = reward.Reward;

    res.status(200).json({ reward_type, reward_value });
  } catch (error) {
    console.error('Discount validation error:', error);
    res.status(500).json({ error: 'Failed to validate discount code.' });
  }
});

module.exports = router;
