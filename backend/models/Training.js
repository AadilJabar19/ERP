const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['technical', 'soft-skills', 'compliance', 'leadership', 'safety', 'other'],
    required: true
  },
  type: {
    type: String,
    enum: ['online', 'classroom', 'workshop', 'seminar', 'conference'],
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  instructor: {
    name: { type: String },
    email: { type: String },
    organization: { type: String }
  },
  location: {
    type: String,
    trim: true
  },
  maxParticipants: {
    type: Number,
    default: 20
  },
  participants: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    enrolledDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'dropped', 'no-show'],
      default: 'enrolled'
    },
    completionDate: { type: Date },
    score: { type: Number },
    feedback: { type: String }
  }],
  materials: [{
    name: { type: String },
    url: { type: String },
    type: { type: String } // pdf, video, link, etc.
  }],
  cost: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed', 'cancelled'],
    default: 'planned'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
trainingSchema.index({ category: 1, type: 1 });
trainingSchema.index({ status: 1 });
trainingSchema.index({ startDate: -1 });

module.exports = mongoose.model('Training', trainingSchema);