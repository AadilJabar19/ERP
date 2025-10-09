const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionNumber: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  reference: String,
  entries: [{
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    description: String
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'posted'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);