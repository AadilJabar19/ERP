const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/claryx-erp');
    
    const adminEmail = 'admin@test.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    const adminUser = new User({
      name: 'Admin User',
      email: adminEmail,
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
  }
};

createAdminUser();