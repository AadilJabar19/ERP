const express = require('express');
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');
const User = require('../models/User');
const router = express.Router();

// Get all activities
router.get('/', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = await Activity.find()
      .populate('userId', 'name')
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    const formattedActivities = activities.map(activity => ({
      ...activity,
      userName: activity.userId?.name || 'System'
    }));
    
    res.json(formattedActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Get activities for specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const activities = await Activity.find({ userId })
      .populate('userId', 'name')
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    const formattedActivities = activities.map(activity => ({
      ...activity,
      userName: activity.userId?.name || 'System'
    }));
    
    res.json(formattedActivities);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ message: 'Error fetching user activities' });
  }
});

module.exports = router;