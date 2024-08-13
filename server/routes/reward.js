const express = require("express");
const yup = require("yup");
const { Rewards, Sequelize } = require("../models");
const uploadFile = require('../middleware/uploadfile');
const router = express.Router();

// Validation schema for rewards
const rewardSchema = yup.object().shape({
    reward_name: yup.string().required("Reward name is required"),
    reward_description: yup.string(),
    reward_points: yup.number().required("Reward points are required").min(0, "Reward points must be at least 0"),
    reward_expiry_date: yup.date().required("Reward expiry date is required").typeError("Invalid date format. Please use YYYY-MM-DD."),
    reward_image: yup.string().url("Invalid URL format").nullable(),
    reward_value: yup.number().required("Reward value is required").min(0, "Reward value must be at least 0"),
    reward_type: yup.string().oneOf(['Discount_Voucher', 'Cash_Voucher', 'Others'], 'Invalid reward type').required("Reward type is required"),
});

// Validation schema for updating ecoPoints
const updateEcoPointsSchema = yup.object().shape({
    resident_id: yup.number().required("Resident ID is required"),
    points: yup.number().required("Points are required").integer("Points must be an integer"),
});

// Create a reward
router.post("/", uploadFile.single('reward_image'), async (req, res) => {
    try {
        const {
            reward_name,
            reward_description,
            reward_points,
            reward_expiry_date,
            reward_value,
            reward_type,
        } = req.body;

        const reward_image = req.file ? req.file.location : null;

        await rewardSchema.validate({
            reward_name,
            reward_description,
            reward_points,
            reward_expiry_date,
            reward_image,
            reward_value,
            reward_type,
        });

        const reward = await Rewards.create({
            reward_name,
            reward_description,
            reward_points,
            reward_expiry_date,
            reward_image,
            reward_value,
            reward_type,
        });

        res.status(201).json(reward);
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(400).json({ error: error.message });
    }
});

// Display all rewards
router.get("/", async (req, res) => {
    try {
        const rewards = await Rewards.findAll();
        res.json(rewards);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Display a reward by ID
router.get("/:id", async (req, res) => {
    try {
        const reward = await Rewards.findByPk(req.params.id);
        if (!reward) {
            return res.status(404).json({ error: "Reward not found" });
        }
        res.json(reward);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a reward
router.put("/:id", uploadFile.single('reward_image'), async (req, res) => {
    try {
        const reward = await Rewards.findByPk(req.params.id);
        if (!reward) {
            return res.status(404).json({ error: "Reward not found" });
        }

        const {
            reward_name,
            reward_description,
            reward_points,
            reward_expiry_date,
            reward_value,
            reward_type,
        } = req.body;

        const reward_image = req.file ? req.file.location : reward.reward_image;

        await rewardSchema.validate({
            reward_name,
            reward_description,
            reward_points,
            reward_expiry_date,
            reward_image,
            reward_value,
            reward_type,
        });

        await reward.update({
            reward_name,
            reward_description,
            reward_points,
            reward_expiry_date,
            reward_image,
            reward_value,
            reward_type,
        });

        res.status(200).json(reward);
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(400).json({ error: error.message });
    }
});

// Soft delete a reward
router.put('/softdelete/:id', async (req, res) => {
    try {
        const rewards = await Rewards.findByPk(req.params.id);
        if (!rewards) {
            return res.status(404).json({ error: 'Reward not found' });
        }
        
        const updatedRewards = await rewards.update({ is_deleted: true });
        res.status(200).json(updatedRewards);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Soft restore a reward
router.put('/softrestore/:id', async (req, res) => {
    try {
        const rewards = await Rewards.findByPk(req.params.id);
        if (!rewards) {
            return res.status(404).json({ error: 'Reward not found' });
        }
        
        const updatedRewards = await rewards.update({ is_deleted: false });
        res.status(200).json(updatedRewards);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update ecoPoints for a resident
router.put("/update-ecoPoints", async (req, res) => {
    try {
        const { resident_id, points } = req.body;

        // Validate the request body
        await updateEcoPointsSchema.validate({ resident_id, points });

        // Find the resident by ID
        const resident = await Resident.findByPk(resident_id);
        if (!resident) {
            return res.status(404).json({ error: "Resident not found" });
        }

        // Update the ecoPoints
        const updatedEcoPoints = resident.ecoPoints + points;
        await resident.update({ ecoPoints: updatedEcoPoints });

        // Return the updated ecoPoints
        res.status(200).json({ ecoPoints: updatedEcoPoints });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
