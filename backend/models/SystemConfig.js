const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  category: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validationRules: {
    type: { type: String, enum: ['string', 'number', 'boolean', 'array', 'object'] },
    required: { type: Boolean, default: false },
    min: Number,
    max: Number,
    enum: [String]
  }
}, { timestamps: true });

// Pre-populate with default configurations
systemConfigSchema.statics.initializeDefaults = async function() {
  const defaults = [
    { key: 'company.name', value: 'Claryx ERP System', category: 'company', description: 'Company name' },
    { key: 'company.currency', value: 'USD', category: 'company', description: 'Default currency' },
    { key: 'security.sessionTimeout', value: 24, category: 'security', description: 'Session timeout in hours' },
    { key: 'security.passwordPolicy.minLength', value: 8, category: 'security', description: 'Minimum password length' },
    { key: 'security.passwordPolicy.requireSpecialChars', value: true, category: 'security', description: 'Require special characters' },
    { key: 'security.maxLoginAttempts', value: 5, category: 'security', description: 'Maximum login attempts' },
    { key: 'notifications.email.enabled', value: true, category: 'notifications', description: 'Enable email notifications' },
    { key: 'inventory.lowStockThreshold', value: 10, category: 'inventory', description: 'Low stock alert threshold' },
    { key: 'finance.taxRate', value: 0.1, category: 'finance', description: 'Default tax rate' }
  ];

  for (const config of defaults) {
    await this.findOneAndUpdate(
      { key: config.key },
      config,
      { upsert: true, new: true }
    );
  }
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema);