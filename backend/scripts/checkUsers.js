const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/claryx-erp');
    console.log('Connected to MongoDB');
    
    const users = await User.find({});
    console.log('Users in database:', users.length);
    
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUsers();