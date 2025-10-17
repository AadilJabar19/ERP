const mongoose = require('mongoose');

const bomSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  components: [{
    component: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
  }],
  version: { type: String, default: '1.0' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const workOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  bom: { type: mongoose.Schema.Types.ObjectId, ref: 'BOM', required: true },
  status: { type: String, enum: ['planned', 'in-progress', 'completed', 'cancelled'], default: 'planned' },
  startDate: { type: Date },
  endDate: { type: Date },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  actualCost: { type: Number, default: 0 },
  estimatedCost: { type: Number, required: true },
  notes: { type: String }
}, { timestamps: true });

const BOM = mongoose.model('BOM', bomSchema);
const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);

module.exports = { BOM, WorkOrder };