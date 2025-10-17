const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  payPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  earnings: {
    baseSalary: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    bonuses: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 }
  },
  deductions: {
    tax: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    retirement: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  totalDeductions: { type: Number, default: 0 },
  netPay: { type: Number, required: true },
  status: {
    type: String,
    enum: ['draft', 'processed', 'paid'],
    default: 'draft'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processedDate: { type: Date, default: Date.now },
  paidDate: { type: Date },
  notes: { type: String }
}, {
  timestamps: true
});

// Index for efficient queries
payrollSchema.index({ employee: 1, 'payPeriod.startDate': -1 });
payrollSchema.index({ status: 1 });

module.exports = mongoose.model('Payroll', payrollSchema);