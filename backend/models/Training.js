const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    enum: ['technical', 'soft-skills', 'compliance', 'leadership', 'safety', 'product'], 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['online', 'classroom', 'workshop', 'seminar', 'certification'], 
    required: true 
  },
  instructor: {
    name: String,
    email: String,
    company: String
  },
  duration: { type: Number, required: true }, // in hours
  maxParticipants: { type: Number, default: 20 },
  cost: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: String,
  materials: [String],
  prerequisites: [String],
  learningObjectives: [String],
  participants: [{
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    enrolledDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['enrolled', 'completed', 'failed', 'cancelled'], default: 'enrolled' },
    completionDate: Date,
    score: Number,
    feedback: String,
    certificateIssued: { type: Boolean, default: false }
  }],
  status: { 
    type: String, 
    enum: ['planned', 'active', 'completed', 'cancelled'], 
    default: 'planned' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Training', trainingSchema);