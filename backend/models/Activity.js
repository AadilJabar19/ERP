const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'upload', 'download', 'approve', 'reject', 'comment', 'assign', 'complete'],
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    enum: ['HRM', 'Inventory', 'Sales', 'CRM', 'Projects', 'Finance', 'Attendance', 'System', 'Analytics'],
    required: true,
  },
  details: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Add index for better query performance
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);