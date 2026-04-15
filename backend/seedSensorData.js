const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const SensorData = require('./models/SensorData');
const User = require('./models/User');

const seedSensorData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrosmart');
        console.log('✅ Connected to MongoDB');

        // Find the admin user
        const admin = await User.findOne({ email: 'admin@agrosmart.com' });
        if (!admin) {
            console.log('❌ Admin user not found. Please run seedAdmin.js first.');
            process.exit(1);
        }

        // Clear existing sensor data
        await SensorData.deleteMany({});
        console.log('🗑️  Cleared existing sensor data');

        // Create sample sensor data for the last 7 days
        const sensorDataEntries = [];
        const now = new Date();

        for (let i = 0; i < 168; i++) { // 168 hours = 7 days
            const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Every hour

            sensorDataEntries.push({
                userId: admin._id,
                fieldId: 'field-1',
                soilMoisture: Math.floor(Math.random() * 30) + 40, // 40-70%
                temperature: Math.floor(Math.random() * 10) + 18, // 18-28°C
                humidity: Math.floor(Math.random() * 20) + 60, // 60-80%
                waterTankLevel: Math.floor(Math.random() * 30) + 60, // 60-90%
                rainfall: Math.random() < 0.2 ? Math.floor(Math.random() * 5) : 0, // Occasional rain
                timestamp
            });
        }

        // Insert sensor data
        await SensorData.insertMany(sensorDataEntries);
        console.log(`✅ Successfully seeded ${sensorDataEntries.length} sensor data entries`);

        console.log('\n📊 Sample Data Summary:');
        console.log('   - Time Range: Last 7 days (hourly readings)');
        console.log('   - Field ID: field-1');
        console.log('   - User: admin@agrosmart.com');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding sensor data:', error);
        process.exit(1);
    }
};

seedSensorData();
