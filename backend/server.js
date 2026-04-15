require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
const authMiddleware = require('./middleware/auth');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Connect to database
connectDB().then(() => {
    // Initialize services
    const schedulerService = require('./services/schedulerService');
    schedulerService.init();
    
    // Initialize ThingSpeak polling
    const thingSpeakService = require('./services/thingSpeakService');
    thingSpeakService.init();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/sensors', authMiddleware, require('./routes/sensors'));
app.use('/api/irrigation', authMiddleware, require('./routes/irrigation'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', authMiddleware, require('./routes/reports'));
app.use('/api/weather', authMiddleware, require('./routes/weather'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'AgroSmart API is running',
        timestamp: new Date().toISOString()
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    // Join user-specific room for targeted updates
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════╗
  ║   🌾 AgroSmart API Server Running    ║
  ║   Port: ${PORT}                        ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}         ║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
