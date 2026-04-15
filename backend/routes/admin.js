const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Crop = require('../models/Crop');
const SensorData = require('../models/SensorData');
const IrrigationLog = require('../models/IrrigationLog');
const Alert = require('../models/Alert');
const SystemConfig = require('../models/SystemConfig');

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

// Get all users with pagination and search
router.get('/users', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '' } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalUsers: count
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get specific user details
router.get('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's sensor data count
        const sensorDataCount = await SensorData.countDocuments({ userId: user._id });

        // Get user's irrigation logs count
        const irrigationCount = await IrrigationLog.countDocuments({ userId: user._id });

        res.json({
            user,
            stats: {
                sensorDataCount,
                irrigationCount
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user status (activate/deactivate)
router.put('/users/:id/status', adminAuth, async (req, res) => {
    try {
        const { isActive } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = isActive;
        await user.save();

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting admin users
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin users' });
        }

        // Delete user's data
        await SensorData.deleteMany({ userId: user._id });
        await IrrigationLog.deleteMany({ userId: user._id });
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User and associated data deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ============================================
// CROP MANAGEMENT ROUTES
// ============================================

// Create new crop
router.post('/crops', adminAuth, async (req, res) => {
    try {
        const crop = new Crop(req.body);
        await crop.save();

        res.status(201).json({
            message: 'Crop created successfully',
            crop
        });
    } catch (error) {
        console.error('Create crop error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update crop
router.put('/crops/:id', adminAuth, async (req, res) => {
    try {
        const crop = await Crop.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        res.json({
            message: 'Crop updated successfully',
            crop
        });
    } catch (error) {
        console.error('Update crop error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete crop
router.delete('/crops/:id', adminAuth, async (req, res) => {
    try {
        const crop = await Crop.findByIdAndDelete(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        res.json({ message: 'Crop deleted successfully' });
    } catch (error) {
        console.error('Delete crop error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ============================================
// SYSTEM MONITORING ROUTES
// ============================================

// Get system-wide statistics
router.get('/system/stats', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'farmer' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalCrops = await Crop.countDocuments();
        const totalSensorReadings = await SensorData.countDocuments();
        const totalIrrigations = await IrrigationLog.countDocuments();

        // Get active irrigations
        const activeIrrigations = await IrrigationLog.countDocuments({
            status: 'active'
        });

        // Get recent users (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Calculate total water used
        const irrigationLogs = await IrrigationLog.find({ status: 'Completed' });
        const totalWaterUsed = irrigationLogs.reduce((sum, log) => sum + (log.waterVolume || 0), 0);

        res.json({
            users: {
                total: totalUsers,
                admins: totalAdmins,
                recentSignups: recentUsers
            },
            crops: totalCrops,
            sensorReadings: totalSensorReadings,
            irrigations: {
                total: totalIrrigations,
                active: activeIrrigations,
                totalWaterUsed: Math.round(totalWaterUsed)
            }
        });
    } catch (error) {
        console.error('Get system stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all sensor data across all farms
router.get('/sensors/all', adminAuth, async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        const sensorData = await SensorData.find()
            .populate('userId', 'name email farmDetails.farmName')
            .limit(limit * 1)
            .sort({ timestamp: -1 });

        res.json({ sensorData });
    } catch (error) {
        console.error('Get all sensor data error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all irrigation sessions
router.get('/irrigation/all', adminAuth, async (req, res) => {
    try {
        const { limit = 50, status = '' } = req.query;

        const query = status ? { status } : {};

        const irrigationLogs = await IrrigationLog.find(query)
            .populate('userId', 'name email farmDetails.farmName')
            .limit(limit * 1)
            .sort({ startTime: -1 });

        res.json({ irrigationLogs });
    } catch (error) {
        console.error('Get all irrigation logs error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

// Get water usage analytics
router.get('/analytics/water-usage', adminAuth, async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const irrigationLogs = await IrrigationLog.find({
            startTime: { $gte: startDate },
            status: 'Completed'
        }).populate('userId', 'name farmDetails.farmName');

        // Group by date
        const dailyUsage = {};
        irrigationLogs.forEach(log => {
            const date = log.startTime.toISOString().split('T')[0];
            if (!dailyUsage[date]) {
                dailyUsage[date] = 0;
            }
            dailyUsage[date] += log.waterVolume || 0;
        });

        // Group by user
        const userUsage = {};
        irrigationLogs.forEach(log => {
            const userId = log.userId._id.toString();
            if (!userUsage[userId]) {
                userUsage[userId] = {
                    name: log.userId.name,
                    farmName: log.userId.farmDetails?.farmName || 'N/A',
                    totalWater: 0,
                    irrigationCount: 0
                };
            }
            userUsage[userId].totalWater += log.waterVolume || 0;
            userUsage[userId].irrigationCount += 1;
        });

        res.json({
            dailyUsage,
            userUsage: Object.values(userUsage),
            totalWaterUsed: Object.values(dailyUsage).reduce((sum, val) => sum + val, 0)
        });
    } catch (error) {
        console.error('Get water usage analytics error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get sensor trends across all farms
router.get('/analytics/sensor-trends', adminAuth, async (req, res) => {
    try {
        const { days = 7 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const sensorData = await SensorData.find({
            timestamp: { $gte: startDate }
        }).sort({ timestamp: 1 });

        // Calculate averages by day
        const dailyAverages = {};
        sensorData.forEach(data => {
            const date = data.timestamp.toISOString().split('T')[0];
            if (!dailyAverages[date]) {
                dailyAverages[date] = {
                    soilMoisture: [],
                    temperature: [],
                    humidity: [],
                    waterTankLevel: []
                };
            }
            dailyAverages[date].soilMoisture.push(data.soilMoisture);
            dailyAverages[date].temperature.push(data.temperature);
            dailyAverages[date].humidity.push(data.humidity);
            dailyAverages[date].waterTankLevel.push(data.waterTankLevel);
        });

        // Calculate final averages
        const trends = Object.keys(dailyAverages).map(date => ({
            date,
            avgSoilMoisture: Math.round(dailyAverages[date].soilMoisture.reduce((a, b) => a + b, 0) / dailyAverages[date].soilMoisture.length),
            avgTemperature: Math.round(dailyAverages[date].temperature.reduce((a, b) => a + b, 0) / dailyAverages[date].temperature.length * 10) / 10,
            avgHumidity: Math.round(dailyAverages[date].humidity.reduce((a, b) => a + b, 0) / dailyAverages[date].humidity.length),
            avgWaterTankLevel: Math.round(dailyAverages[date].waterTankLevel.reduce((a, b) => a + b, 0) / dailyAverages[date].waterTankLevel.length)
        }));

        res.json({ trends });
    } catch (error) {
        console.error('Get sensor trends error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get irrigation efficiency metrics
router.get('/analytics/irrigation-efficiency', adminAuth, async (req, res) => {
    try {
        const totalIrrigations = await IrrigationLog.countDocuments({ status: 'Completed' });
        const manualIrrigations = await IrrigationLog.countDocuments({
            status: 'Completed',
            triggerType: 'Manual'
        });
        const autoIrrigations = await IrrigationLog.countDocuments({
            status: 'Completed',
            triggerType: 'Automatic'
        });

        // Calculate average duration
        const completedLogs = await IrrigationLog.find({ status: 'Completed' });
        const avgDuration = completedLogs.length > 0
            ? completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / completedLogs.length
            : 0;

        res.json({
            totalIrrigations,
            manualIrrigations,
            autoIrrigations,
            avgDuration: Math.round(avgDuration),
            automationRate: totalIrrigations > 0
                ? Math.round((autoIrrigations / totalIrrigations) * 100)
                : 0
        });
    } catch (error) {
        console.error('Get irrigation efficiency error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ============================================
// ALERT & SYSTEM CONFIG ROUTES
// ============================================

// Get all system alerts
router.get('/alerts', adminAuth, async (req, res) => {
    try {
        const { limit = 50, severity = '' } = req.query;
        const query = severity ? { severity } : {};

        const alerts = await Alert.find(query)
            .populate('userId', 'name email')
            .limit(limit * 1)
            .sort({ timestamp: -1 });

        res.json({ alerts });
    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Broadcast message to all users
router.post('/alerts/broadcast', adminAuth, async (req, res) => {
    try {
        const { message, severity = 'info' } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Create a system-wide alert
        const alert = new Alert({
            type: 'broadcast',
            severity,
            message,
            source: 'administrator'
        });

        await alert.save();

        // Emit to all connected sockets
        req.io.emit('system_broadcast', {
            message,
            severity,
            timestamp: new Date()
        });

        res.status(201).json({
            message: 'Broadcast sent successfully',
            alert
        });
    } catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get global system configuration
router.get('/config', adminAuth, async (req, res) => {
    try {
        let config = await SystemConfig.findOne();

        if (!config) {
            // Initialize if not exists
            config = new SystemConfig();
            await config.save();
        }

        res.json({ config });
    } catch (error) {
        console.error('Get config error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update global system configuration
router.put('/config', adminAuth, async (req, res) => {
    try {
        let config = await SystemConfig.findOne();

        if (!config) {
            config = new SystemConfig();
        }

        const updates = req.body;
        Object.keys(updates).forEach(key => {
            config[key] = updates[key];
        });

        config.lastUpdatedBy = req.userId;
        await config.save();

        // If maintenance mode toggled, notify everyone
        if (updates.hasOwnProperty('maintenanceMode')) {
            req.io.emit('maintenance_update', {
                enabled: config.maintenanceMode,
                message: config.maintenanceMode ? 'System is undergoing maintenance' : 'System is back online'
            });
        }

        res.json({
            message: 'System configuration updated successfully',
            config
        });
    } catch (error) {
        console.error('Update config error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
