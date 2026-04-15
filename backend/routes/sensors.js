const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');
const irrigationController = require('../controllers/irrigationController');

// Receive sensor data (from IoT devices or manual input)
router.post('/data', async (req, res) => {
    try {
        // Calculate erosion risk
        const User = require('../models/User');
        const user = await User.findById(req.userId);
        const { calculateErosionRisk } = require('../services/riskService');
        const risk = calculateErosionRisk(req.body, user);

        const sensorData = new SensorData({
            userId: req.userId,
            ...req.body,
            terrainRisk: {
                score: risk.score,
                level: risk.level
            }
        });

        await sensorData.save();

        // Check if alerts need to be sent
        await irrigationController.checkAndSendAlerts(req.userId);

        // Emit real-time update via Socket.io
        if (req.io) {
            req.io.to(`user_${req.userId}`).emit('sensorUpdate', {
                ...sensorData.toObject(),
                terrainRisk: risk
            });
        }

        res.status(201).json({
            success: true,
            message: 'Sensor data recorded',
            data: sensorData,
            terrainRisk: risk
        });

    } catch (error) {
        console.error('Error recording sensor data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get latest sensor data
router.get('/latest', async (req, res) => {
    try {
        const { fieldId } = req.query;

        const query = {};
        if (fieldId) query.fieldId = fieldId;

        const latestData = await SensorData.findOne(query)
            .sort({ timestamp: -1 });

        if (!latestData) {
            return res.status(404).json({ message: 'No sensor data found' });
        }

        res.json({
            success: true,
            data: latestData
        });

    } catch (error) {
        console.error('Error fetching latest sensor data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get historical sensor data
router.get('/history', async (req, res) => {
    try {
        const { fieldId, startDate, endDate, limit = 100 } = req.query;

        const query = {};
        if (fieldId) query.fieldId = fieldId;

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const sensorData = await SensorData.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: sensorData.length,
            data: sensorData
        });

    } catch (error) {
        console.error('Error fetching sensor history:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get aggregated statistics
router.get('/stats', async (req, res) => {
    try {
        const { fieldId, days = 7 } = req.query;

        const query = {
            timestamp: {
                $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            }
        };
        if (fieldId) query.fieldId = fieldId;

        const stats = await SensorData.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    avgMoisture: { $avg: '$soilMoisture' },
                    minMoisture: { $min: '$soilMoisture' },
                    maxMoisture: { $max: '$soilMoisture' },
                    avgTemperature: { $avg: '$temperature' },
                    avgHumidity: { $avg: '$humidity' },
                    totalRainfall: { $sum: '$rainfall' }
                }
            }
        ]);

        res.json({
            success: true,
            stats: stats[0] || {}
        });

    } catch (error) {
        console.error('Error fetching sensor stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
