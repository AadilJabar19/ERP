const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerCode: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  mobile: String,
  website: String,
  taxId: String,
  creditLimit: { type: Number, default: 0 },
  paymentTerms: { type: String, enum: ['net15', 'net30', 'net45', 'net60', 'cod'], default: 'net30' },
  currency: { type: String, default: 'USD' },
  addresses: [{
    type: { type: String, enum: ['billing', 'shipping'], required: true },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  contacts: [{
    name: String,
    title: String,
    email: String,
    phone: String,
    department: String
  }],
  status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
  category: { type: String, enum: ['retail', 'wholesale', 'distributor', 'enterprise'], default: 'retail' },
  salesRep: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);