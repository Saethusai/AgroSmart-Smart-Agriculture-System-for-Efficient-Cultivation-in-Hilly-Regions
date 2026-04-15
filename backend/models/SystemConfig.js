const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    defaultMoistureThreshold: {
        type: Number,
        default: 30
    },
    defaultTempMax: {
        type: Number,
        default: 40
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    broadcastMessage: {
        type: String,
        default: ''
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
