const express = require('express');
const router = express.Router();
const { PointRecord, Resident, Orders, Course } = require('../models');

// Create a new point record
router.post('/', async (req, res) => {
    try {
        const { resident_id, order_id, points, description } = req.body;

        // Create the point record
        const pointRecord = await PointRecord.create({
            resident_id,
            order_id,
            points,
            description
        });

        res.status(201).json(pointRecord);
    } catch (error) {
        console.error('Error creating point record:', error);
        res.status(500).json({ error: 'Failed to create point record' });
    }
});

// Get all point records
router.get('/', async (req, res) => {
    try {
        const pointRecords = await PointRecord.findAll({
            include: [
                { model: Resident, attributes: ['name', 'EcoPoints'] },
                { model: Orders, attributes: ['order_id', 'course_id', 'order_date', 'order_status'],
                  include: [{ model: Course, attributes: ['course_date', 'course_end_time'] }]
                }
            ]
        });

        res.status(200).json(pointRecords);
    } catch (error) {
        console.error('Error fetching point records:', error);
        res.status(500).json({ error: 'Failed to fetch point records' });
    }
});

// Get a specific point record by ID
router.get('/:id', async (req, res) => {
    try {
        const pointRecord = await PointRecord.findByPk(req.params.id, {
            include: [
                { model: Resident, attributes: ['name', 'EcoPoints'] },
                { model: Orders, attributes: ['order_id', 'course_id', 'order_date', 'order_status'],
                  include: [{ model: Course, attributes: ['course_date', 'course_end_time'] }]
                }
            ]
        });

        if (!pointRecord) {
            return res.status(404).json({ error: 'Point record not found' });
        }

        res.status(200).json(pointRecord);
    } catch (error) {
        console.error('Error fetching point record:', error);
        res.status(500).json({ error: 'Failed to fetch point record' });
    }
});

// Update a point record by ID
router.put('/:id', async (req, res) => {
    try {
        const { points, description, status } = req.body;

        const pointRecord = await PointRecord.findByPk(req.params.id);
        if (!pointRecord) {
            return res.status(404).json({ error: 'Point record not found' });
        }

        pointRecord.points = points;
        pointRecord.description = description;
        pointRecord.status = status;
        await pointRecord.save();

        res.status(200).json(pointRecord);
    } catch (error) {
        console.error('Error updating point record:', error);
        res.status(500).json({ error: 'Failed to update point record' });
    }
});

// Delete a point record by ID
router.delete('/:id', async (req, res) => {
    try {
        const pointRecord = await PointRecord.findByPk(req.params.id);
        if (!pointRecord) {
            return res.status(404).json({ error: 'Point record not found' });
        }

        await pointRecord.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting point record:', error);
        res.status(500).json({ error: 'Failed to delete point record' });
    }
});

module.exports = router;
