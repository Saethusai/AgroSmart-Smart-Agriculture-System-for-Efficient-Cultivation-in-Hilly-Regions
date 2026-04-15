require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const IrrigationLog = require('./models/IrrigationLog');

connectDB().then(async () => {
    try {
        const result = await IrrigationLog.updateMany({ status: 'In Progress' }, { $set: { status: 'Completed' } });
        console.log(`Updated ${result.modifiedCount} stuck logs.`);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
