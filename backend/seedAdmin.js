const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
    createAdminUser();
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function createAdminUser() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@agrosmart.com' });

        if (existingAdmin) {
            console.log('Admin user already exists');
            console.log('Email: admin@agrosmart.com');
            process.exit(0);
        }

        // Create admin user
        const admin = new User({
            name: 'Admin',
            email: 'admin@agrosmart.com',
            password: 'admin123',
            phone: '0000000000',
            role: 'admin',
            farmDetails: {
                farmName: 'System Admin',
                location: {
                    address: 'System'
                }
            }
        });

        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@agrosmart.com');
        console.log('Password: admin123');
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}
