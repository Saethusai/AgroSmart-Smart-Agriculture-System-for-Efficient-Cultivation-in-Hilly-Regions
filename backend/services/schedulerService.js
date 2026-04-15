const IrrigationSchedule = require('../models/IrrigationSchedule');
const irrigationController = require('../controllers/irrigationController');
const SensorData = require('../models/SensorData');
const User = require('../models/User');
const { calculateErosionRisk } = require('../services/riskService');

/**
 * Smart Scheduler Service
 * Handles recurring irrigation tasks with environmental intelligence
 */
class SchedulerService {
    constructor() {
        this.interval = null;
    }

    init() {
        console.log('⏰ Smart Scheduler Service initialized');
        // Run check every minute
        this.interval = setInterval(() => this.checkSchedules(), 60000);
        // Also run immediately on start
        this.checkSchedules();
    }

    async checkSchedules() {
        try {
            const now = new Date();
            const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            // Find all enabled schedules for this time and day
            const schedules = await IrrigationSchedule.find({
                isEnabled: true,
                startTime: currentTime,
                days: currentDay
            });

            if (schedules.length > 0) {
                console.log(`🔍 Found ${schedules.length} active schedules for ${currentTime}`);
                for (const schedule of schedules) {
                    await this.processSchedule(schedule);
                }
            }
        } catch (error) {
            console.error('Error in Scheduler Service:', error);
        }
    }

    async processSchedule(schedule) {
        try {
            const { userId, fieldId, smartConditions } = schedule;

            // 1. Fetch Latest Telemetry
            const latestData = await SensorData.findOne({ userId, fieldId }).sort({ timestamp: -1 });
            const user = await User.findById(userId);

            if (!latestData || !user) {
                console.log(`⚠️ Skipping schedule for user ${userId}: Insufficient data`);
                return;
            }

            // 2. Perform Smart Checks
            let skipReason = null;

            // Check if it's currently raining
            if (smartConditions.skipIfRaining && latestData.rainfall > 0) {
                skipReason = 'Precipitation detected (Rain-Skip active)';
            }

            // Predictive Check: Check forecast for upcoming rain
            if (!skipReason && smartConditions.skipIfRaining) {
                const weatherService = require('./weatherService');
                const { latitude, longitude } = user.farmDetails?.location || { latitude: 0, longitude: 0 };
                const willRain = await weatherService.willItRainSoon(latitude, longitude);
                if (willRain) {
                    skipReason = 'Heavy precipitation forecasted in the next 12 hours (Predictive-Skip active)';
                }
            }

            // Check moisture threshold
            if (!skipReason && latestData.soilMoisture > smartConditions.moistureThreshold) {
                skipReason = `Soil moisture (${latestData.soilMoisture}%) above threshold (${smartConditions.moistureThreshold}%)`;
            }

            // Check Terrain Risk (Safety First!)
            if (!skipReason && smartConditions.preventLaharRisk) {
                const risk = calculateErosionRisk(latestData, user);
                if (risk.level === 'Critical' || risk.level === 'High') {
                    skipReason = `Critical terrain risk level (${risk.level}) - Irrigation suspended for safety`;
                }
            }

            if (skipReason) {
                console.log(`🚫 Schedule skipped: ${skipReason}`);
                return;
            }

            // 3. Initiate Irrigation
            console.log(`💧 Initiating scheduled irrigation for user ${userId} (Duration: ${schedule.duration}m)`);
            await irrigationController.startIrrigation(
                userId,
                fieldId,
                'Scheduled',
                `Automated cycle: ${schedule.startTime}`
            );

            // 4. Auto-stop after duration
            setTimeout(async () => {
                // Find the active log to stop it
                const activeLog = await require('../models/IrrigationLog').findOne({
                    userId,
                    fieldId,
                    status: 'In Progress',
                    triggerType: 'Scheduled'
                }).sort({ startTime: -1 });

                if (activeLog) {
                    console.log(`⏹️ Automatically stopping scheduled irrigation cycle ${activeLog._id}`);
                    await irrigationController.stopIrrigation(activeLog._id, userId);
                }
            }, schedule.duration * 60000);

        } catch (error) {
            console.error('Error processing schedule:', error);
        }
    }
}

module.exports = new SchedulerService();
