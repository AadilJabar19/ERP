const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionToken: { type: String, required: true, unique: true },
  deviceInfo: {
    userAgent: String,
    ip: String,
    browser: String,
    os: String,
    device: String
  },
  location: {
    country: String,
    city: String,
    coordinates: [Number]
  },
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  riskScore: { type: Number, default: 0 }, // AI-based risk assessment
  loginMethod: { type: String, enum: ['password', 'sso', 'biometric', '2fa'], default: 'password' }
}, { timestamps: true });

userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('UserSession', userSessionSchema);