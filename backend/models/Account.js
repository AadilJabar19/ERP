const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountCode: { type: String, required: true, unique: true },
  accountName: { type: String, required: true },
  accountType: { 
    type: String, 
    required: true,
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense']
  },
  parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  balance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);