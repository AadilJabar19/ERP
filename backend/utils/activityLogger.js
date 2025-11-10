const Activity = require('../models/Activity');

const logActivity = async (userId, type, action, module, details = null) => {
  try {
    const activity = new Activity({
      userId,
      type,
      action,
      module,
      details,
      timestamp: new Date()
    });
    
    await activity.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };