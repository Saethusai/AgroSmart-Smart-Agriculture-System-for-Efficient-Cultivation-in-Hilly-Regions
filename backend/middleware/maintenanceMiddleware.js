const SystemConfig = require('../models/SystemConfig');

const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Admins can bypass maintenance mode
        if (req.userRole === 'admin') {
            return next();
        }

        const config = await SystemConfig.findOne();

        if (config && config.maintenanceMode) {
            return res.status(503).json({
                success: false,
                message: 'System is currently in Maintenance Mode. State modifications are temporarily restricted.',
                type: 'maintenance'
            });
        }

        next();
    } catch (error) {
        console.error('Maintenance middleware error:', error);
        next(); // Proceed if config check fails to avoid system lockout
    }
};

module.exports = maintenanceMiddleware;
