const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  leadNumber: { type: String, required: true, unique: true },
  source: { type: String, enum: ['website', 'referral', 'cold-call', 'email', 'social-media', 'trade-show', 'advertisement'], required: true },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'], default: 'new' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  
  contact: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    jobTitle: String,
    company: String
  },
  
  company: {
    name: String,
    industry: String,
    size: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  
  opportunity: {
    value: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    probability: { type: Number, min: 0, max: 100, default: 10 },
    expectedCloseDate: Date,
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    requirements: String,
    budget: Number
  },
  
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  activities: [{
    type: { type: String, enum: ['call', 'email', 'meeting', 'demo', 'proposal', 'follow-up'] },
    date: { type: Date, default: Date.now },
    notes: String,
    outcome: String,
    nextAction: String,
    nextActionDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  tags: [String],
  notes: String,
  lostReason: String,
  convertedDate: Date,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);