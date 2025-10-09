const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: Number, required: true },
  department: String,
  items: [{
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    budgetedAmount: { type: Number, required: true },
    actualAmount: { type: Number, default: 0 },
    variance: { type: Number, default: 0 }
  }],
  totalBudget: { type: Number, required: true },
  totalActual: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'approved', 'active'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);