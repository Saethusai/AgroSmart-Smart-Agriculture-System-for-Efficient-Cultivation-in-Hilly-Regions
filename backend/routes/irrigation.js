const express = require('express');
const router = express.Router();
const IrrigationLog = require('../models/IrrigationLog');
const irrigationController = require('../controllers/irrigationController');
const maintenanceMiddleware = require('../middleware/maintenanceMiddleware');
const authMiddleware = require('../middleware/auth'); // Assuming this exists as per server.js

// Get irrigation recommendation
router.get('/recommendation', async (req, res) => {
    try {
        const { fieldId } = req.query;

        const decision = await irrigationController.analyzeAndDecide(
            req.userId,
            fieldId
        );

        res.json({
            success: true,
            recommendation: decision
        });

    } catch (error) {
        console.error('Error getting irrigation recommendation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Manual irrigation control - Start
router.post('/start', authMiddleware, maintenanceMiddleware, async (req, res) => {
    try {
        const { fieldId = 'field-1', reason = 'Manual start by user' } = req.body;

        const result = await irrigationController.startIrrigation(
            req.userId,
            fieldId,
            'Manual',
            reason
        );

        // Emit real-time update
        if (req.io) {
            req.io.to(`user_${req.userId}`).emit('irrigationStarted', result);
        }

        res.json(result);

    } catch (error) {
        console.error('Error starting irrigation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Manual irrigation control - Stop
router.post('/stop/:irrigationId', authMiddleware, maintenanceMiddleware, async (req, res) => {
    try {
        const result = await irrigationController.stopIrrigation(
            req.params.irrigationId,
            req.userId
        );

        // Emit real-time update
        if (req.io) {
            req.io.to(`user_${req.userId}`).emit('irrigationStopped', result);
        }

        res.json(result);

    } catch (error) {
        console.error('Error stopping irrigation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get current irrigation status
router.get('/status', async (req, res) => {
    try {
        const { fieldId } = req.query;

        const query = {
            userId: req.userId,
            status: 'In Progress'
        };
        if (fieldId) query.fieldId = fieldId;

        const activeIrrigation = await IrrigationLog.findOne(query)
            .sort({ startTime: -1 });

        res.json({
            success: true,
            isActive: !!activeIrrigation,
            irrigation: activeIrrigation
        });

    } catch (error) {
        console.error('Error fetching irrigation status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get irrigation logs/history
router.get('/logs', async (req, res) => {
    try {
        const { fieldId, startDate, endDate, limit = 50 } = req.query;

        const query = { userId: req.userId };
        if (fieldId) query.fieldId = fieldId;

        if (startDate || endDate) {
            query.startTime = {};
            if (startDate) query.startTime.$gte = new Date(startDate);
            if (endDate) query.startTime.$lte = new Date(endDate);
        }

        const logs = await IrrigationLog.find(query)
            .sort({ startTime: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: logs.length,
            logs
        });

    } catch (error) {
        console.error('Error fetching irrigation logs:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get irrigation statistics
router.get('/stats', async (req, res) => {
    try {
        const { fieldId, days = 30 } = req.query;

        const query = {
            userId: req.userId,
            startTime: {
                $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            },
            status: 'Completed'
        };
        if (fieldId) query.fieldId = fieldId;

        const stats = await IrrigationLog.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalIrrigations: { $sum: 1 },
                    totalDuration: { $sum: '$duration' },
                    totalWaterUsed: { $sum: '$waterVolume' },
                    avgDuration: { $avg: '$duration' },
                    manualCount: {
                        $sum: { $cond: [{ $eq: ['$triggerType', 'Manual'] }, 1, 0] }
                    },
                    automaticCount: {
                        $sum: { $cond: [{ $eq: ['$triggerType', 'Automatic'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            stats: stats[0] || {
                totalIrrigations: 0,
                totalDuration: 0,
                totalWaterUsed: 0
            }
        });

    } catch (error) {
        console.error('Error fetching irrigation stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// --- Smart Scheduler Routes ---

// @route   GET api/irrigation/schedules
// @desc    Get all irrigation schedules for user
router.get('/schedules', authMiddleware, async (req, res) => {
    try {
        const IrrigationSchedule = require('../models/IrrigationSchedule');
        const schedules = await IrrigationSchedule.find({ userId: req.userId });
        res.json({ success: true, schedules });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST api/irrigation/schedules
// @desc    Create a new irrigation schedule
router.post('/schedules', authMiddleware, async (req, res) => {
    try {
        const IrrigationSchedule = require('../models/IrrigationSchedule');
        const schedule = new IrrigationSchedule({
            ...req.body,
            userId: req.userId
        });
        await schedule.save();
        res.status(201).json({ success: true, schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT api/irrigation/schedules/:id
// @desc    Update/Toggle a schedule
router.put('/schedules/:id', authMiddleware, async (req, res) => {
    try {
        const IrrigationSchedule = require('../models/IrrigationSchedule');
        const schedule = await IrrigationSchedule.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        );
        res.json({ success: true, schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE api/irrigation/schedules/:id
// @desc    Delete a schedule
router.delete('/schedules/:id', authMiddleware, async (req, res) => {
    try {
        const IrrigationSchedule = require('../models/IrrigationSchedule');
        await IrrigationSchedule.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ success: true, message: 'Schedule removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
