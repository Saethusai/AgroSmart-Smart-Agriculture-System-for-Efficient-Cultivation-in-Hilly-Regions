const mongoose = require('mongoose');

const irrigationScheduleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fieldId: {
        type: String,
        default: 'field-1'
    },
    startTime: {
        type: String, // HH:mm format
        required: true
    },
    days: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    duration: {
        type: Number, // in minutes
        required: true,
        default: 15
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    smartConditions: {
        skipIfRaining: {
            type: Boolean,
            default: true
        },
        moistureThreshold: {
            type: Number,
            default: 60 // If moisture is above this, skip
        },
        preventLaharRisk: {
            type: Boolean,
            default: true // Skip if terrain risk is Critical
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('IrrigationSchedule', irrigationScheduleSchema);
