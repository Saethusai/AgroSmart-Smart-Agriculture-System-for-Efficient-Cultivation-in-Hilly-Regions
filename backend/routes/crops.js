const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');

// Get all crops
router.get('/', async (req, res) => {
    try {
        const { category, suitableForHilly } = req.query;

        let query = {};
        if (category) query.category = category;
        if (suitableForHilly === 'true') query.suitableForHillyRegions = true;

        const crops = await Crop.find(query).sort({ name: 1 });

        res.json({
            success: true,
            count: crops.length,
            crops
        });

    } catch (error) {
        console.error('Error fetching crops:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single crop by ID
router.get('/:id', async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        res.json({
            success: true,
            crop
        });

    } catch (error) {
        console.error('Error fetching crop:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Search crops by name
router.get('/search/:name', async (req, res) => {
    try {
        const crops = await Crop.find({
            name: new RegExp(req.params.name, 'i')
        }).limit(10);

        res.json({
            success: true,
            count: crops.length,
            crops
        });

    } catch (error) {
        console.error('Error searching crops:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
