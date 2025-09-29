const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  movementType: { 
    type: String, 
    enum: ['in', 'out', 'transfer', 'adjustment', 'return', 'damage', 'loss'], 
    required: true 
  },
  transactionType: {
    type: String,
    enum: ['purchase', 'sale', 'transfer', 'adjustment', 'return', 'production', 'consumption'],
    required: true
  },
  quantity: { type: Number, required: true },
  unitCost: Number,
  totalValue: Number,
  
  // Reference documents
  referenceType: {
    type: String,
    enum: ['purchase-order', 'sales-order', 'transfer-order', 'adjustment', 'return', 'production-order']
  },
  referenceId: String,
  referenceNumber: String,
  
  // Location details
  fromLocation: {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    zone: String,
    bin: String
  },
  toLocation: {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    zone: String,
    bin: String
  },
  
  // Batch/Serial tracking
  batchNumber: String,
  serialNumbers: [String],
  expiryDate: Date,
  
  // User and approval
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalDate: Date,
  
  // Status and notes
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  notes: String,
  reason: String,
  
  // Running balance after this movement
  runningBalance: Number,
  
  // Timestamps
  movementDate: { type: Date, default: Date.now },
  processedDate: Date
}, { timestamps: true });

// Indexes for performance
stockMovementSchema.index({ product: 1, movementDate: -1 });
stockMovementSchema.index({ warehouse: 1, movementDate: -1 });
stockMovementSchema.index({ movementType: 1 });
stockMovementSchema.index({ referenceType: 1, referenceId: 1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);