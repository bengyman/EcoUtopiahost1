const express = require('express');
const { Resident, Rewards, RedeemReward } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto'); // Import crypto for voucher code generation
const router = express.Router();

// Helper function to generate a voucher code
const generateVoucherCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // Generates an 8-character voucher code
};

// Redeem a reward
router.post('/redeem', authenticateToken, async (req, res) => {
  const transaction = await RedeemReward.sequelize.transaction();
  try {
    const { rewardId } = req.body;
    const userId = req.user.id; // Assuming authenticateToken sets req.user

    const resident = await Resident.findOne({ where: { user_id: userId }, transaction });
    const reward = await Rewards.findByPk(rewardId, { transaction });

    if (!resident || !reward) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Resident or Reward not found' });
    }

    if (resident.ecoPoints < reward.reward_points) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Insufficient EcoPoints to redeem this reward.' });
    }

    // Deduct EcoPoints
    resident.ecoPoints -= reward.reward_points;
    await resident.save({ transaction });

    // Generate a voucher code
    let voucherCode;
    let isUnique = false;

    // Ensure the voucher code is unique by checking the database
    while (!isUnique) {
      voucherCode = generateVoucherCode();
      const existingVoucher = await RedeemReward.findOne({ where: { voucher_code: voucherCode }, transaction });
      if (!existingVoucher) {
        isUnique = true;
      }
    }

    // Create the RedeemReward entry with the voucher code
    const redeemReward = await RedeemReward.create({
      resident_id: resident.resident_id,
      reward_id: reward.reward_id,
      voucher_code: voucherCode,
    }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Reward redeemed successfully!', redeemReward });
  } catch (error) {
    await transaction.rollback();
    console.error('Error redeeming reward:', error);
    res.status(500).json({ error: 'Failed to redeem reward.' });
  }
});

// Fetch all redeemed rewards for a specific resident
router.get('/:resident_id', authenticateToken, async (req, res) => {
    try {
      const { resident_id } = req.params;
  
      const redeemedRewards = await RedeemReward.findAll({
        where: { resident_id },
        include: [
          {
            model: Rewards,
            as: 'Reward',
          },
        ],
      });
  
      res.status(200).json(redeemedRewards);
    } catch (error) {
      console.error('Error fetching redeemed rewards:', error);
      res.status(500).json({ error: 'Failed to fetch redeemed rewards' });
    }
});

module.exports = router;
