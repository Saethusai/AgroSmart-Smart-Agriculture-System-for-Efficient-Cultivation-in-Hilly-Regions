const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fieldId: {
        type: String,
        default: 'field-1'
    },
    soilMoisture: {
        type: Number, // percentage (0-100)
        required: true
    },
    temperature: {
        type: Number, // in Celsius
        required: true
    },
    humidity: {
        type: Number, // percentage (0-100)
        required: true
    },
    waterTankLevel: {
        type: Number, // percentage (0-100)
        default: 100
    },
    rainfall: {
        type: Number, // in mm
        default: 0
    },
    location: {
        latitude: Number,
        longitude: Number
    },
    terrainRisk: {
        score: Number,
        level: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
sensorDataSchema.index({ userId: 1, timestamp: -1 });
sensorDataSchema.index({ fieldId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
