const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: String,
  client: { type: String, required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  budget: { type: Number, required: true },
  actualCost: { type: Number, default: 0 },
  status: { type: String, enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'], default: 'planning' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  milestones: [{
    name: String,
    dueDate: Date,
    completed: { type: Boolean, default: false },
    completedDate: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);