const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Password not required if using Google OAuth
        },
        minlength: 6
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    phone: {
        type: String,
        required: false // Optional for Google OAuth users
    },
    farmDetails: {
        farmName: String,
        location: {
            address: String,
            latitude: Number,
            longitude: Number
        },
        farmSize: Number, // in acres
        cropType: String,
        slopeAngle: {
            type: Number,
            default: 0 // in degrees
        },
        soilType: {
            type: String,
            enum: ['Sandy', 'Loamy', 'Clay', 'Silty', 'Peaty', 'Saline'],
            default: 'Loamy'
        }
    },
    preferences: {
        smsAlerts: {
            type: Boolean,
            default: true
        },
        emailAlerts: {
            type: Boolean,
            default: true
        },
        alertThresholds: {
            lowMoisture: {
                type: Number,
                default: 30
            },
            lowWaterTank: {
                type: Number,
                default: 20
            },
            highTemperature: {
                type: Number,
                default: 35 // Celsius
            },
            lowTemperature: {
                type: Number,
                default: 10 // Celsius
            },
            highHumidity: {
                type: Number,
                default: 85 // Percentage
            },
            lowHumidity: {
                type: Number,
                default: 30 // Percentage
            },
            erosionRisk: {
                type: Number,
                default: 70 // Score out of 100
            }
        }
    },
    role: {
        type: String,
        enum: ['farmer', 'admin'],
        default: 'farmer'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Skip password hashing if no password (Google OAuth user)
    if (!this.password || !this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    // If no password set (Google OAuth user), return false
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
