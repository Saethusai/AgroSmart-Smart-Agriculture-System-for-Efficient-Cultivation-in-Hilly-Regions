const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    scientificName: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['vegetable', 'fruit', 'grain', 'pulse', 'spice', 'other'],
        default: 'other'
    },
    description: {
        type: String,
        default: ''
    },
    // Water requirements in mm/week
    waterRequirement: {
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 0
        },
        optimal: {
            type: Number,
            default: 0
        }
    },
    // Soil moisture percentage
    soilMoisture: {
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 0
        },
        optimal: {
            type: Number,
            default: 0
        }
    },
    // Temperature in Celsius
    temperature: {
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 0
        },
        optimal: {
            type: Number,
            default: 0
        }
    },
    growingTips: {
        type: String,
        default: ''
    },
    harvestTime: {
        type: String,
        default: ''
    },
    // Legacy fields for backward compatibility with CropDatabase.jsx
    optimalSoilMoisture: {
        type: Number,
        default: function () {
            return this.soilMoisture?.optimal || 60;
        }
    },
    optimalTemp: {
        min: {
            type: Number,
            default: function () {
                return this.temperature?.min || 15;
            }
        },
        max: {
            type: Number,
            default: function () {
                return this.temperature?.max || 30;
            }
        }
    },
    optimalHumidity: {
        min: {
            type: Number,
            default: 40
        },
        max: {
            type: Number,
            default: 70
        }
    },
    growthDuration: {
        type: Number,
        default: 90
    },
    sunlightRequirement: {
        type: String,
        default: 'Full Sun'
    },
    suitableForHillyRegions: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual to ensure backward compatibility
cropSchema.virtual('tips').get(function () {
    return this.growingTips ? [this.growingTips] : [];
});

module.exports = mongoose.model('Crop', cropSchema);
