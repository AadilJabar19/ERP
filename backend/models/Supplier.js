const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierCode: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  taxId: String,
  paymentTerms: { type: String, enum: ['net15', 'net30', 'net45', 'net60', 'cod'], default: 'net30' },
  currency: { type: String, default: 'USD' },
  category: { type: String, enum: ['raw-materials', 'finished-goods', 'services', 'equipment'], required: true },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  addresses: [{
    type: { type: String, enum: ['billing', 'shipping'], required: true },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  bankDetails: {
    bankName: String,
    accountNumber: String,
    routingNumber: String,
    swiftCode: String
  },
  certifications: [String],
  status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);