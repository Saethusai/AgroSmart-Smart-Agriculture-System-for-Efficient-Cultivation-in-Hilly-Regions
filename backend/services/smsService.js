const axios = require('axios');

class SMSService {
    constructor() {
        this.apiKey = process.env.FAST2SMS_API_KEY;
    }

    async sendSMS(to, message) {
        try {
            // If Fast2SMS API key is not configured, log the message instead
            if (!this.apiKey) {
                console.log('📱 SMS (Mock Mode):', {
                    to,
                    message,
                    timestamp: new Date().toISOString()
                });
                return {
                    success: true,
                    mock: true,
                    message: 'SMS logged (Fast2SMS not configured)'
                };
            }

            // Clean the phone number (remove +91 if present for Fast2SMS)
            let cleanNumber = to.replace('+', '');
            if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
                cleanNumber = cleanNumber.substring(2);
            }

            const response = await axios.post(
                'https://www.fast2sms.com/dev/bulkV2',
                {
                    route: 'q',
                    message: message,
                    language: 'english',
                    flash: 0,
                    numbers: cleanNumber
                },
                {
                    headers: {
                        'authorization': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ SMS sent successfully:', response.data.request_id);
            return {
                success: true,
                messageId: response.data.request_id
            };
        } catch (error) {
            console.error('❌ SMS sending failed:', error.response ? error.response.data.message : error.message);
            return {
                success: false,
                error: error.response ? error.response.data.message : error.message
            };
        }
    }

    async sendLowMoistureAlert(user, moistureLevel) {
        const message = `AgroSmart Alert: Soil moisture is low (${moistureLevel}%). Irrigation recommended for your ${user.farmDetails.cropType || 'crops'}.`;
        return await this.sendSMS(user.phone, message);
    }

    async sendIrrigationStartAlert(user) {
        const message = `AgroSmart: Irrigation has started for your field. You'll receive a notification when it's complete.`;
        return await this.sendSMS(user.phone, message);
    }

    async sendIrrigationCompleteAlert(user, duration) {
        const message = `AgroSmart: Irrigation completed successfully. Duration: ${duration} minutes.`;
        return await this.sendSMS(user.phone, message);
    }

    async sendLowWaterTankAlert(user, tankLevel) {
        const message = `AgroSmart Alert: Water tank level is low (${tankLevel}%). Please refill to ensure continuous irrigation.`;
        return await this.sendSMS(user.phone, message);
    }

    async sendHighTemperatureAlert(user, temperature) {
        const message = `AgroSmart Alert: High temperature detected (${temperature}°C). Your crops may need additional water. Monitor soil moisture closely.`;
        return await this.sendSMS(user.phone, message);
    }

    async sendLowTemperatureAlert(user, temperature) {
        const message = `AgroSmart Alert: Low temperature detected (${temperature}°C). Frost risk for your ${user.farmDetails.cropType || 'crops'}. Take protective measures.`;
        return await this.sendSMS(user.phone, message);
    }

    async sendHighHumidityAlert(user, humidity) {
        const message = `AgroSmart Alert: High humidity level (${humidity}%). Risk of fungal diseases. Monitor your crops closely.`;
        return await this.sendSMS(user.phone, message);
    }

    async sendLowHumidityAlert(user, humidity) {
        const message = `AgroSmart Alert: Low humidity level (${humidity}%). Increased water evaporation. Check irrigation schedule.`;
        return await this.sendSMS(user.phone, message);
    }

    async sendSensorDataAlert(user, alertType, value, message) {
        const smsMessage = `AgroSmart Alert: ${message}`;
        return await this.sendSMS(user.phone, smsMessage);
    }

    async sendSystemErrorAlert(user, errorType) {
        const message = `AgroSmart Alert: System error detected - ${errorType}. Please check your irrigation system.`;
        return await this.sendSMS(user.phone, message);
    }
}

module.exports = new SMSService();
