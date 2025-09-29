const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  quoteNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  
  validUntil: { type: Date, required: true },
  issueDate: { type: Date, default: Date.now },
  
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true }
  }],
  
  pricing: {
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },
  
  terms: {
    paymentTerms: { type: String, default: 'Net 30' },
    deliveryTerms: String,
    warranty: String,
    validityPeriod: { type: Number, default: 30 }, // days
    notes: String
  },
  
  status: { type: String, enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'], default: 'draft' },
  
  salesRep: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  revisions: [{
    version: Number,
    changes: String,
    date: { type: Date, default: Date.now },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  followUps: [{
    date: Date,
    notes: String,
    nextAction: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  convertedToOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
  conversionDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Quote', quoteSchema);