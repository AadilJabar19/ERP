const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['crm', 'accounting', 'messaging', 'ecommerce', 'ai'], required: true },
  provider: { type: String, required: true }, // hubspot, quickbooks, slack, etc.
  config: {
    apiKey: String,
    apiSecret: String,
    webhookUrl: String,
    settings: mongoose.Schema.Types.Mixed
  },
  isActive: { type: Boolean, default: false },
  lastSync: { type: Date },
  syncStatus: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' }
}, { timestamps: true });

const webhookLogSchema = new mongoose.Schema({
  integration: { type: mongoose.Schema.Types.ObjectId, ref: 'Integration' },
  event: { type: String, required: true },
  payload: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['processed', 'failed', 'pending'], default: 'pending' },
  response: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const Integration = mongoose.model('Integration', integrationSchema);
const WebhookLog = mongoose.model('WebhookLog', webhookLogSchema);

module.exports = { Integration, WebhookLog };