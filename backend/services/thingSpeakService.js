const axios = require('axios');
const SensorData = require('../models/SensorData');
const User = require('../models/User');
const irrigationController = require('../controllers/irrigationController');

class ThingSpeakService {
    constructor() {
        this.interval = null;
        this.lastTimestamp = null;
        this.lastValues = {
            temperature: null,
            humidity: null,
            soilMoisture: null,
            waterLevel: null
        };

        // Exact API Endpoints provided
        this.endpoints = {
            temperature: 'https://api.thingspeak.com/channels/3295531/fields/1/last?results=2',
            humidity: 'https://api.thingspeak.com/channels/3295531/fields/2/last?results=2',
            soilMoisture: 'https://api.thingspeak.com/channels/3295531/fields/3/last?results=2',
            waterLevel: 'https://api.thingspeak.com/channels/3295531/fields/4/last?results=2'
        };
    }

    init() {
        console.log('📡 ThingSpeak Service initialized. Polling every 15 seconds.');
        // Update data every 15 seconds exactly
        this.interval = setInterval(() => this.pollData(), 15000);
        // Also run immediately on start
        this.pollData();
    }

    async pollData() {
        try {
            // Wait for all 4 requests to complete
            const [tempRes, humRes, soilRes, waterRes] = await Promise.all([
                axios.get(this.endpoints.temperature),
                axios.get(this.endpoints.humidity),
                axios.get(this.endpoints.soilMoisture),
                axios.get(this.endpoints.waterLevel)
            ]);

            // The 'last' endpoint returns either JSON or text. If JSON includes a 'feeds' array? 
            // Wait, for ThingSpeak, `/last` usually returns a plain text string representing the last entry.
            // Let's parse them depending on type. But wait, `results=2` means it returns a JSON object like {"channel": {...}, "feeds": [{...}, {...}]} but the user specified exactly `/last?results=2`. 
            // `/last` typically returns just a raw value or string. If it's a string, we parse it. If it's JSON with feeds, we use feeds[0] or whatever. 
            // Wait, `/fields/1/last` returns plain text of the last value, the query `?results=2` is typically ignored by `/last` endpoint, it returns plain text anyway. 
            // So axios response `data` could be a string or number. Let's safely extract it.

            const safeExtract = (res, fieldName) => {
                if (typeof res.data === 'object' && res.data !== null && res.data.created_at) {
                    // if it returned JSON of the last feed
                    return parseFloat(res.data[fieldName]) || 0;
                } else if (typeof res.data === 'object' && res.data.feeds && res.data.feeds.length > 0) {
                    return parseFloat(res.data.feeds[res.data.feeds.length - 1][fieldName]) || 0;
                }
                // if it's plain text/number
                return parseFloat(res.data) || 0;
            };

            const newTemperature = safeExtract(tempRes, 'field1');
            const newHumidity = safeExtract(humRes, 'field2');
            const newSoilMoisture = safeExtract(soilRes, 'field3');
            const newWaterLevel = safeExtract(waterRes, 'field4');

            // Wait, is there a timestamp we could check? Without `created_at` from `/last`, we just have the data.
            // We check if value changed compared to last known.
            const hasChanged = (
                newTemperature !== this.lastValues.temperature ||
                newHumidity !== this.lastValues.humidity ||
                newSoilMoisture !== this.lastValues.soilMoisture ||
                newWaterLevel !== this.lastValues.waterLevel
            );

            // ThingSpeak updates every 15s. Store data ONLY if value changed OR new timestamp. 
            // Since we can't reliably get timestamp from plain text, we will just use `hasChanged` logic.
            // Or we check if it is not totally equal 
            if (hasChanged) {
                // Get the main admin user to associate the data with
                let defaultUser = await User.findOne({ email: 'saethusai@gmail.com' });
                if (!defaultUser) {
                    // Fallback to first user if the specific admin email doesn't exist
                    defaultUser = await User.findOne({});
                }
                
                if (!defaultUser) {
                    console.log('⚠️ ThingSpeak Service: Cannot save data - No user exists in database yet.');
                    return;
                }

                const sensorData = new SensorData({
                    userId: defaultUser._id,
                    fieldId: 'field-1', // Default field
                    temperature: newTemperature,
                    humidity: newHumidity,
                    soilMoisture: newSoilMoisture,
                    waterTankLevel: newWaterLevel,
                    timestamp: new Date()
                });

                await sensorData.save();
                
                this.lastValues = {
                    temperature: newTemperature,
                    humidity: newHumidity,
                    soilMoisture: newSoilMoisture,
                    waterLevel: newWaterLevel
                };
                console.log(`✅ ThingSpeak Data Synced: T=${newTemperature}°C, H=${newHumidity}%, SM=${newSoilMoisture}%, WL=${newWaterLevel}%`);
                
                // CRITICAL FIX: Automatically trigger the threshold alert check for this user now that we have new data!
                await irrigationController.checkAndSendAlerts(defaultUser._id);
                
                // Real-time update logic can be sent via sockets here if needed, but since we rely on `SensorData` polling we might just log it.
                // For a proper solution, we could grab 'req.io' from main server if we had it, but standard frontend polling handles it anyway (30s polling in Dashboard).
            }

        } catch (error) {
            console.error('❌ Error fetching data from ThingSpeak:', error.message);
        }
    }
}

module.exports = new ThingSpeakService();
