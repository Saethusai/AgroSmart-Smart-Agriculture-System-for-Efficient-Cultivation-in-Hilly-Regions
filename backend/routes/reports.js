const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const SensorData = require('../models/SensorData');
const IrrigationLog = require('../models/IrrigationLog');
const { calculateErosionRisk } = require('../services/riskService');
const User = require('../models/User');

// @route   GET api/reports/summary
// @desc    Get aggregated data summary
// @access  Private
router.get('/summary', authMiddleware, async (req, res) => {
    try {
        const { startDate, endDate, fieldId = 'field-1' } = req.query;
        const query = {
            fieldId,
            timestamp: {
                $gte: new Date(startDate || new Date().setDate(new Date().getDate() - 7)),
                $lte: new Date(endDate || new Date())
            }
        };

        const sensorData = await SensorData.find(query).sort({ timestamp: 1 });
        const irrigationLogs = await IrrigationLog.find({
            fieldId,
            startTime: { $gte: query.timestamp.$gte, $lte: query.timestamp.$lte }
        });

        // Calculate averages
        const avgMoisture = sensorData.reduce((acc, curr) => acc + curr.soilMoisture, 0) / (sensorData.length || 1);
        const totalWater = irrigationLogs.reduce((acc, curr) => acc + (curr.waterVolume || 0), 0);
        const totalRainfall = sensorData.reduce((acc, curr) => acc + (curr.rainfall || 0), 0);

        // Get latest risk level
        const user = await User.findById(req.userId);
        const latestData = sensorData[sensorData.length - 1] || { soilMoisture: 0, rainfall: 0 };
        const risk = calculateErosionRisk(latestData, user);

        res.json({
            averages: {
                soilMoisture: Math.round(avgMoisture * 10) / 10,
                rainfall: Math.round(totalRainfall * 10) / 10,
                waterUsed: totalWater
            },
            risk,
            dataPoints: sensorData.length,
            irrigationCount: irrigationLogs.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reports/export
// @desc    Export data as CSV
// @access  Private
router.get('/export', authMiddleware, async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        let data = [];
        let csvHeader = '';

        const filter = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        if (type === 'sensors') {
            data = await SensorData.find(filter).sort({ createdAt: -1 });
            csvHeader = 'Timestamp,Soil Moisture (%),Temp (C),Humidity (%),Rainfall (mm),Water Tank (%)\n';
            data = data.map(d => `"${new Date(d.timestamp).toLocaleString()}",${d.soilMoisture},${d.temperature},${d.humidity},${d.rainfall},${d.waterTankLevel}`).join('\n');
        } else {
            data = await IrrigationLog.find(filter).sort({ createdAt: -1 });
            csvHeader = 'Start Time,End Time,Duration (min),Volume (L),Type,Reason,Status\n';
            data = data.map(d => `"${new Date(d.startTime).toLocaleString()}","${d.endTime ? new Date(d.endTime).toLocaleString() : 'N/A'}",${d.duration},${d.waterVolume || 0},${d.triggerType},${d.triggerReason},${d.status}`).join('\n');
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
        res.status(200).send(csvHeader + data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
