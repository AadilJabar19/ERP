const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/claryx-erp');
    
    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create test admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('Test admin user created:');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.disconnect();
  }
};

createTestUser();