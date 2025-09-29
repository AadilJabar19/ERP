const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  level: { type: Number, default: 0 },
  path: String, // e.g., "Electronics/Computers/Laptops"
  attributes: [{
    name: String,
    type: { type: String, enum: ['text', 'number', 'boolean', 'date', 'select'] },
    required: { type: Boolean, default: false },
    options: [String] // for select type
  }],
  taxCategory: String,
  commissionRate: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

categorySchema.pre('save', function(next) {
  if (this.parent) {
    this.level = (this.parent.level || 0) + 1;
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);