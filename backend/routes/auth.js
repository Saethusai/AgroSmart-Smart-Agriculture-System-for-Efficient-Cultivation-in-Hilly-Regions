const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const maintenanceMiddleware = require('../middleware/maintenanceMiddleware');
const authMiddleware = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('../services/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register new user
router.post('/register', maintenanceMiddleware, async (req, res) => {
    try {
        const { name, email, password, phone, farmDetails } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            phone,
            farmDetails
        });

        await user.save();

        // Send email notification to admin about new registration
        emailService.sendNewUserRegistrationAlert(user).catch(err => {
            console.error('Failed to send admin notification email:', err);
        });

        // Send welcome email to the new user
        emailService.sendWelcomeEmail(user).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                farmDetails: user.farmDetails
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                farmDetails: user.farmDetails,
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user profile (protected route)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user profile
router.put('/profile', authMiddleware, maintenanceMiddleware, async (req, res) => {
    try {
        const { name, phone, farmDetails, preferences } = req.body;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields safely to preserve nested properties and trigger Mongoose tracking
        if (name) user.name = name;
        if (phone) user.phone = phone;
        
        if (farmDetails) {
            ['farmName', 'cropType', 'slopeAngle', 'soilType'].forEach(key => {
                if (farmDetails[key] !== undefined) {
                    user.farmDetails[key] = farmDetails[key];
                }
            });
        }
        
        if (preferences) {
            if (preferences.smsAlerts !== undefined) user.preferences.smsAlerts = preferences.smsAlerts;
            if (preferences.emailAlerts !== undefined) user.preferences.emailAlerts = preferences.emailAlerts;
            
            if (preferences.alertThresholds) {
                ['lowMoisture', 'lowWaterTank'].forEach(key => {
                    if (preferences.alertThresholds[key] !== undefined) {
                        user.preferences.alertThresholds[key] = preferences.alertThresholds[key];
                    }
                });
            }
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                farmDetails: user.farmDetails,
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Google OAuth Login
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists with this Google ID
        let user = await User.findOne({ googleId });

        if (!user) {
            // Check if user exists with this email
            user = await User.findOne({ email });

            if (user) {
                // Link Google account to existing user
                user.googleId = googleId;
                await user.save();
            } else {
                // Create new user with Google account
                user = new User({
                    name,
                    email,
                    googleId,
                    phone: '', // Optional for Google users
                    farmDetails: {
                        farmName: '',
                        location: {
                            address: ''
                        }
                    }
                });

                await user.save();

                // Send email notifications for new user
                emailService.sendNewUserRegistrationAlert(user).catch(err => {
                    console.error('Failed to send admin notification email:', err);
                });

                emailService.sendWelcomeEmail(user).catch(err => {
                    console.error('Failed to send welcome email:', err);
                });
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Google login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                farmDetails: user.farmDetails,
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Google authentication failed', error: error.message });
    }
});

module.exports = router;
