const mongoose = require('mongoose');

const irrigationLogSchema = new mongoose.Schema({
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
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    waterVolume: {
        type: Number, // in liters
        default: 0
    },
    triggerType: {
        type: String,
        enum: ['Manual', 'Automatic', 'Scheduled'],
        required: true
    },
    triggerReason: {
        type: String // e.g., "Low soil moisture", "Scheduled irrigation", "Manual override"
    },
    soilMoistureBefore: {
        type: Number
    },
    soilMoistureAfter: {
        type: Number
    },
    status: {
        type: String,
        enum: ['In Progress', 'Completed', 'Failed', 'Cancelled'],
        default: 'In Progress'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient querying
irrigationLogSchema.index({ userId: 1, startTime: -1 });
irrigationLogSchema.index({ status: 1 });

module.exports = mongoose.model('IrrigationLog', irrigationLogSchema);
