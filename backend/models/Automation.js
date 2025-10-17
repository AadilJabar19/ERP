const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  trigger: {
    type: { type: String, enum: ['schedule', 'event', 'webhook'], required: true },
    condition: mongoose.Schema.Types.Mixed, // JSON condition
    schedule: String // cron expression
  },
  actions: [{
    type: { type: String, enum: ['email', 'sms', 'webhook', 'update_record', 'create_record'], required: true },
    config: mongoose.Schema.Types.Mixed
  }],
  isActive: { type: Boolean, default: true },
  lastRun: { type: Date },
  runCount: { type: Number, default: 0 }
}, { timestamps: true });

const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  module: { type: String, required: true },
  steps: [{
    name: String,
    type: { type: String, enum: ['approval', 'notification', 'assignment', 'condition'] },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    condition: mongoose.Schema.Types.Mixed,
    order: Number
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Automation = mongoose.model('Automation', automationSchema);
const Workflow = mongoose.model('Workflow', workflowSchema);

module.exports = { Automation, Workflow };