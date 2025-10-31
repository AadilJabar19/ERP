const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/claryx-erp');
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'admin@test.com' });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', user.name);
    console.log('User active:', user.isActive);
    console.log('User locked:', user.isLocked);
    console.log('Stored password hash:', user.password);
    
    const isValid = await user.comparePassword('admin123');
    console.log('Password comparison result:', isValid);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

testLogin();