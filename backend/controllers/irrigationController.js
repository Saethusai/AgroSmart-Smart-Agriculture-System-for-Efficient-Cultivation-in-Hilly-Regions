const SensorData = require('../models/SensorData');
const IrrigationLog = require('../models/IrrigationLog');
const Crop = require('../models/Crop');
const User = require('../models/User');
const smsService = require('../services/smsService');

class IrrigationController {
    constructor() {
        this.alertCooldowns = new Map();
    }

    // Intelligent irrigation decision logic
    async analyzeAndDecide(userId, fieldId = 'field-1') {
        try {
            // Get latest sensor data
            const latestData = await SensorData.findOne({ userId, fieldId })
                .sort({ timestamp: -1 });

            if (!latestData) {
                return {
                    shouldIrrigate: false,
                    reason: 'No sensor data available'
                };
            }

            // Get user and their crop preferences
            const user = await User.findById(userId);
            const crop = user.farmDetails.cropType
                ? await Crop.findOne({ name: new RegExp(user.farmDetails.cropType, 'i') })
                : null;

            // Determine moisture thresholds
            const criticalMoisture = crop
                ? crop.waterRequirements.criticalMoistureLevel
                : user.preferences.alertThresholds.lowMoisture;

            const optimalMin = crop
                ? crop.waterRequirements.optimalSoilMoisture.min
                : 40;

            // Decision logic
            const currentMoisture = latestData.soilMoisture;
            
            // Calculate Water Percentage correctly based on 10cm depth container
            const currentWaterPercentage = ((10 - latestData.waterTankLevel) / 10) * 100;

            // Check if water tank is too low (compare percentage against settings threshold)
            if (currentWaterPercentage < user.preferences.alertThresholds.lowWaterTank) {
                return {
                    shouldIrrigate: false,
                    reason: 'Water tank level too low',
                    alert: 'CRITICAL_LOW_WATER'
                };
            }

            // Check if irrigation is urgently needed
            if (currentMoisture < criticalMoisture) {
                return {
                    shouldIrrigate: true,
                    reason: `Critical moisture level (${currentMoisture}%)`,
                    urgency: 'HIGH',
                    estimatedDuration: this.calculateIrrigationDuration(currentMoisture, optimalMin)
                };
            }

            // Check if irrigation is recommended
            if (currentMoisture < optimalMin) {
                return {
                    shouldIrrigate: true,
                    reason: `Below optimal moisture (${currentMoisture}%)`,
                    urgency: 'MEDIUM',
                    estimatedDuration: this.calculateIrrigationDuration(currentMoisture, optimalMin)
                };
            }

            return {
                shouldIrrigate: false,
                reason: `Moisture level adequate (${currentMoisture}%)`,
                currentMoisture
            };

        } catch (error) {
            console.error('Error in irrigation analysis:', error);
            throw error;
        }
    }

    // Calculate irrigation duration based on moisture deficit
    calculateIrrigationDuration(currentMoisture, targetMoisture) {
        const deficit = targetMoisture - currentMoisture;
        // Simple formula: 2 minutes per 1% moisture deficit
        // This should be calibrated based on actual field conditions
        const duration = Math.max(5, Math.min(60, deficit * 2));
        return Math.round(duration);
    }

    // Start irrigation
    async startIrrigation(userId, fieldId, triggerType, triggerReason) {
        try {
            const axios = require('axios');
            await axios.get('https://api.thingspeak.com/update?api_key=4G564QPU6KBXW6WE&field1=1').catch(e => console.error('ThingSpeak Actuator Error:', e.message));

            // Get current sensor data
            const latestData = await SensorData.findOne({ userId, fieldId })
                .sort({ timestamp: -1 });

            // Create irrigation log
            const irrigationLog = new IrrigationLog({
                userId,
                fieldId,
                startTime: new Date(),
                triggerType,
                triggerReason,
                soilMoistureBefore: latestData ? latestData.soilMoisture : null,
                status: 'In Progress'
            });

            await irrigationLog.save();

            // Send SMS alert if enabled
            const user = await User.findById(userId);
            if (user && user.preferences.smsAlerts) {
                await smsService.sendIrrigationStartAlert(user);
            }

            return {
                success: true,
                irrigationId: irrigationLog._id,
                message: 'Irrigation started successfully'
            };

        } catch (error) {
            console.error('Error starting irrigation:', error);
            throw error;
        }
    }

    // Stop irrigation
    async stopIrrigation(irrigationId, userId) {
        try {
            const axios = require('axios');
            await axios.get('https://api.thingspeak.com/update?api_key=4G564QPU6KBXW6WE&field1=2').catch(e => console.error('ThingSpeak Actuator Error:', e.message));

            const irrigation = await IrrigationLog.findById(irrigationId);

            if (!irrigation) {
                throw new Error('Irrigation log not found');
            }

            // Get current sensor data for after-moisture reading
            const latestData = await SensorData.findOne({
                userId,
                fieldId: irrigation.fieldId
            }).sort({ timestamp: -1 });

            // Calculate duration
            const endTime = new Date();
            const duration = Math.round((endTime - irrigation.startTime) / 60000); // in minutes

            // Update irrigation log
            irrigation.endTime = endTime;
            irrigation.duration = duration;
            irrigation.soilMoistureAfter = latestData ? latestData.soilMoisture : null;
            irrigation.status = 'Completed';

            // Estimate water volume (simplified calculation)
            irrigation.waterVolume = duration * 10; // 10 liters per minute (example)

            await irrigation.save();

            // Send completion SMS
            const user = await User.findById(userId);
            if (user && user.preferences.smsAlerts) {
                await smsService.sendIrrigationCompleteAlert(user, duration);
            }

            return {
                success: true,
                duration,
                moistureChange: irrigation.soilMoistureAfter - irrigation.soilMoistureBefore,
                message: 'Irrigation stopped successfully'
            };

        } catch (error) {
            console.error('Error stopping irrigation:', error);
            throw error;
        }
    }

    // Check and send alerts
    async checkAndSendAlerts(userId) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.preferences.smsAlerts) {
                return;
            }

            const latestData = await SensorData.findOne({ userId })
                .sort({ timestamp: -1 });

            if (!latestData) {
                return;
            }

            const thresholds = user.preferences.alertThresholds;

            const triggerAlerts = async (title, msg) => {
                const cooldownKey = `${user._id}_${title}`;
                const lastSent = this.alertCooldowns.get(cooldownKey);
                
                // CRITICAL FIX: 30 minute cooldown (1800000 ms) to prevent SMS/Email spam constantly hitting the user
                if (lastSent && (Date.now() - lastSent) < 1800000) {
                    return; // Skip, we already warned them!
                }
                
                // Record the time this alert was fired
                this.alertCooldowns.set(cooldownKey, Date.now());

                if (user.preferences.smsAlerts) {
                    await smsService.sendSensorDataAlert(user, 'THRESHOLD', null, msg);
                }
                if (user.preferences.emailAlerts) {
                    const emailService = require('../services/emailService');
                    await emailService.sendThresholdAlertEmail(user, title, msg);
                }
            };

            // Check low moisture
            if (latestData.soilMoisture < thresholds.lowMoisture) {
                await triggerAlerts('Low Moisture Level', `Soil moisture is critically low at ${latestData.soilMoisture}%. Irrigation highly recommended for your crops.`);
            }

            // Check low water tank (Convert 10cm depth to numerical percentage to compare against user threshold)
            const waterPercentage = ((10 - latestData.waterTankLevel) / 10) * 100;
            if (waterPercentage < thresholds.lowWaterTank) {
                await triggerAlerts('Critical Water Reserve', `Water tank level is critically low (${Math.round(waterPercentage)}%). Please refill to ensure continuous automated irrigation.`);
            }

            // Check high temperature
            if (latestData.temperature > thresholds.highTemperature) {
                await triggerAlerts('High Temperature', `High temperature detected (${latestData.temperature}°C). Your crops may need additional water. Monitor soil moisture closely.`);
            }

            // Check low temperature (frost risk)
            if (latestData.temperature < thresholds.lowTemperature) {
                await triggerAlerts('Low Temperature', `Low temperature detected (${latestData.temperature}°C). Frost risk for your crops. Take protective measures.`);
            }

            // Check high humidity
            if (latestData.humidity > thresholds.highHumidity) {
                await triggerAlerts('High Humidity', `High humidity level (${latestData.humidity}%). Risk of fungal diseases. Monitor your crops closely.`);
            }

            // Check low humidity
            if (latestData.humidity < thresholds.lowHumidity) {
                await triggerAlerts('Low Humidity', `Low humidity level (${latestData.humidity}%). Increased water evaporation expected. Verify your irrigation schedule.`);
            }

        } catch (error) {
            console.error('Error checking alerts:', error);
        }
    }
}

module.exports = new IrrigationController();
