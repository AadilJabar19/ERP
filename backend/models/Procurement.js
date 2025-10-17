const mongoose = require('mongoose');

const procurementSchema = new mongoose.Schema({
  requisitionNumber: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'], 
    default: 'draft' 
  },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalAmount: { type: Number, required: true },
  requestDate: { type: Date, default: Date.now },
  approvalDate: { type: Date },
  expectedDelivery: { type: Date },
  notes: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
}, { timestamps: true });

module.exports = mongoose.model('Procurement', procurementSchema);