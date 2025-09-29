const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  payPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  baseSalary: { type: Number, required: true },
  hoursWorked: { type: Number, default: 0 },
  overtimeHours: { type: Number, default: 0 },
  overtimeRate: { type: Number, default: 1.5 },
  allowances: [{
    type: { type: String, required: true }, // transport, meal, housing, etc.
    amount: { type: Number, required: true },
    taxable: { type: Boolean, default: true }
  }],
  deductions: [{
    type: { type: String, required: true }, // tax, insurance, loan, etc.
    amount: { type: Number, required: true },
    mandatory: { type: Boolean, default: false }
  }],
  bonuses: [{
    type: { type: String, required: true }, // performance, holiday, etc.
    amount: { type: Number, required: true },
    taxable: { type: Boolean, default: true }
  }],
  grossPay: { type: Number, required: true },
  totalDeductions: { type: Number, required: true },
  netPay: { type: Number, required: true },
  taxCalculations: {
    federalTax: { type: Number, default: 0 },
    stateTax: { type: Number, default: 0 },
    socialSecurity: { type: Number, default: 0 },
    medicare: { type: Number, default: 0 },
    unemployment: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['draft', 'calculated', 'approved', 'paid'], default: 'draft' },
  payDate: Date,
  paymentMethod: { type: String, enum: ['bank-transfer', 'check', 'cash'], default: 'bank-transfer' },
  notes: String
}, { timestamps: true });

payrollSchema.index({ employee: 1, 'payPeriod.startDate': 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);