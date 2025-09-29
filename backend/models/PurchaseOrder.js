const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  orderDate: { type: Date, default: Date.now },
  expectedDelivery: { type: Date, required: true },
  actualDelivery: Date,
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    receivedQty: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'partial', 'received'], default: 'pending' }
  }],
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected', 'sent', 'partial', 'received', 'cancelled'], default: 'draft' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  paymentTerms: String,
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: String,
  attachments: [String]
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);