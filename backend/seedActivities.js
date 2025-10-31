const mongoose = require('mongoose');
const User = require('./models/User');
const Activity = require('./models/Activity');
require('dotenv').config();

const seedActivities = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/claryx-erp');
    
    const users = await User.find();
    
    for (const user of users) {
      // Check if user already has activities
      const existingActivities = await Activity.findOne({ userId: user._id });
      
      if (!existingActivities) {
        // Create initial activities for each user
        await Activity.create([
          {
            userId: user._id,
            action: 'Account created',
            timestamp: user.createdAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          {
            userId: user._id,
            action: 'Login successful',
            timestamp: user.lastLogin || new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ]);
        console.log(`Created activities for user: ${user.name}`);
      }
    }
    
    console.log('Activity seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding activities:', error);
    process.exit(1);
  }
};

seedActivities();