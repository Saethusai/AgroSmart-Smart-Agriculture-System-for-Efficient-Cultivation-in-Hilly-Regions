const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Crop = require('./models/Crop');

const crops = [
    {
        name: 'Tomato',
        scientificName: 'Solanum lycopersicum',
        category: 'vegetable',
        description: 'Tomatoes are well-suited for hilly regions with moderate climate.',
        waterRequirement: { min: 20, max: 30, optimal: 25 },
        soilMoisture: { min: 50, max: 80, optimal: 65 },
        temperature: { min: 18, max: 27, optimal: 22 },
        growingTips: 'Requires consistent moisture. Avoid waterlogging. Mulching helps retain moisture.',
        harvestTime: '80-90 days',
        optimalSoilMoisture: 65,
        optimalTemp: { min: 18, max: 27 },
        optimalHumidity: { min: 60, max: 80 },
        growthDuration: 87,
        sunlightRequirement: 'Full Sun',
        suitableForHillyRegions: true
    },
    {
        name: 'Potato',
        scientificName: 'Solanum tuberosum',
        category: 'vegetable',
        description: 'Potatoes thrive in cool hilly climates with adequate moisture.',
        waterRequirement: { min: 25, max: 35, optimal: 30 },
        soilMoisture: { min: 55, max: 75, optimal: 65 },
        temperature: { min: 15, max: 22, optimal: 18 },
        growingTips: 'Critical water need during tuber formation. Good drainage essential. Mulch to maintain soil moisture.',
        harvestTime: '90-120 days',
        optimalSoilMoisture: 65,
        optimalTemp: { min: 15, max: 22 },
        optimalHumidity: { min: 70, max: 90 },
        growthDuration: 100,
        sunlightRequirement: 'Full Sun',
        suitableForHillyRegions: true
    },
    {
        name: 'Cabbage',
        scientificName: 'Brassica oleracea',
        category: 'vegetable',
        description: 'Cabbage is ideal for cool hilly regions.',
        waterRequirement: { min: 15, max: 25, optimal: 20 },
        soilMoisture: { min: 50, max: 75, optimal: 62 },
        temperature: { min: 15, max: 20, optimal: 17 },
        growingTips: 'Consistent moisture needed. Avoid water stress during head formation. Cool temperatures preferred.',
        harvestTime: '70-90 days',
        optimalSoilMoisture: 62,
        optimalTemp: { min: 15, max: 20 },
        optimalHumidity: { min: 60, max: 80 },
        growthDuration: 85,
        sunlightRequirement: 'Full Sun to Partial Shade',
        suitableForHillyRegions: true
    },
    {
        name: 'Maize',
        scientificName: 'Zea mays',
        category: 'grain',
        description: 'Maize can be grown in hilly terraces with proper irrigation.',
        waterRequirement: { min: 30, max: 40, optimal: 35 },
        soilMoisture: { min: 45, max: 70, optimal: 57 },
        temperature: { min: 20, max: 30, optimal: 25 },
        growingTips: 'Critical water need during tasseling and grain filling. Drought sensitive. Ensure adequate spacing.',
        harvestTime: '90-110 days',
        optimalSoilMoisture: 57,
        optimalTemp: { min: 20, max: 30 },
        optimalHumidity: { min: 50, max: 70 },
        growthDuration: 95,
        sunlightRequirement: 'Full Sun',
        suitableForHillyRegions: true
    },
    {
        name: 'Ginger',
        scientificName: 'Zingiber officinale',
        category: 'spice',
        description: 'Ginger is highly suitable for hilly regions with high rainfall.',
        waterRequirement: { min: 25, max: 35, optimal: 28 },
        soilMoisture: { min: 60, max: 85, optimal: 72 },
        temperature: { min: 20, max: 30, optimal: 25 },
        growingTips: 'Requires high moisture and good drainage. Shade tolerant. Mulch heavily to retain moisture.',
        harvestTime: '8-10 months',
        optimalSoilMoisture: 72,
        optimalTemp: { min: 20, max: 30 },
        optimalHumidity: { min: 70, max: 90 },
        growthDuration: 240,
        sunlightRequirement: 'Partial Shade',
        suitableForHillyRegions: true
    },
    {
        name: 'Strawberry',
        scientificName: 'Fragaria × ananassa',
        category: 'fruit',
        description: 'Strawberries grow well in cool hilly climates.',
        waterRequirement: { min: 18, max: 26, optimal: 22 },
        soilMoisture: { min: 55, max: 80, optimal: 67 },
        temperature: { min: 15, max: 25, optimal: 20 },
        growingTips: 'Consistent moisture critical. Drip irrigation recommended. Mulching beneficial for moisture retention.',
        harvestTime: '60-90 days',
        optimalSoilMoisture: 67,
        optimalTemp: { min: 15, max: 25 },
        optimalHumidity: { min: 60, max: 80 },
        growthDuration: 90,
        sunlightRequirement: 'Full Sun',
        suitableForHillyRegions: true
    },
    {
        name: 'Beans',
        scientificName: 'Phaseolus vulgaris',
        category: 'pulse',
        description: 'Beans are suitable for hilly regions with moderate rainfall.',
        waterRequirement: { min: 15, max: 22, optimal: 18 },
        soilMoisture: { min: 45, max: 70, optimal: 57 },
        temperature: { min: 18, max: 28, optimal: 23 },
        growingTips: 'Avoid waterlogging. Critical water during flowering and pod formation. Well-drained soil essential.',
        harvestTime: '50-70 days',
        optimalSoilMoisture: 57,
        optimalTemp: { min: 18, max: 28 },
        optimalHumidity: { min: 60, max: 75 },
        growthDuration: 67,
        sunlightRequirement: 'Full Sun',
        suitableForHillyRegions: true
    },
    {
        name: 'Cardamom',
        scientificName: 'Elettaria cardamomum',
        category: 'spice',
        description: 'Cardamom is ideal for high-altitude hilly regions with heavy rainfall.',
        waterRequirement: { min: 28, max: 38, optimal: 32 },
        soilMoisture: { min: 65, max: 90, optimal: 77 },
        temperature: { min: 10, max: 35, optimal: 22 },
        growingTips: 'Requires shade and high moisture. Grows well under forest canopy. Ensure good drainage despite high water needs.',
        harvestTime: '2-3 years',
        optimalSoilMoisture: 77,
        optimalTemp: { min: 10, max: 35 },
        optimalHumidity: { min: 75, max: 95 },
        growthDuration: 730,
        sunlightRequirement: 'Shade',
        suitableForHillyRegions: true
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrosmart');
        console.log('✅ Connected to MongoDB');

        // Clear existing crops
        await Crop.deleteMany({});
        console.log('🗑️  Cleared existing crops');

        // Insert new crops
        await Crop.insertMany(crops);
        console.log(`✅ Successfully seeded ${crops.length} crops`);

        // Display crops
        console.log('\n📋 Seeded Crops:');
        crops.forEach(crop => {
            console.log(`   - ${crop.name} (${crop.category})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
