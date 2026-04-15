const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const weatherService = require('../services/weatherService');
const User = require('../models/User');

// @route   GET api/weather/current
// @desc    Get current weather for user's farm location
router.get('/current', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const { latitude, longitude } = user.farmDetails?.location || { latitude: 0, longitude: 0 };

        const weather = await weatherService.getCurrentWeather(latitude, longitude);
        res.json({ success: true, weather });
    } catch (error) {
        console.error('Weather Route Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET api/weather/forecast
// @desc    Get forecast for user's farm location
router.get('/forecast', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const { latitude, longitude } = user.farmDetails?.location || { latitude: 0, longitude: 0 };

        const forecast = await weatherService.getForecast(latitude, longitude);
        res.json({ success: true, forecast });
    } catch (error) {
        console.error('Forecast Route Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
