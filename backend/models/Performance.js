const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewType: {
    type: String,
    enum: ['annual', 'quarterly', 'probation', 'promotion', 'mid-year'],
    required: true
  },
  reviewPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  competencies: [{
    name: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String }
  }],
  goals: [{
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'not-met'],
      default: 'pending'
    },
    dueDate: { type: Date },
    completionDate: { type: Date }
  }],
  strengths: [{ type: String }],
  areasForImprovement: [{ type: String }],
  developmentPlan: {
    objectives: [{ type: String }],
    timeline: { type: String },
    resources: [{ type: String }]
  },
  comments: { type: String },
  employeeComments: { type: String },
  status: {
    type: String,
    enum: ['draft', 'in-review', 'completed', 'acknowledged'],
    default: 'draft'
  },
  nextReviewDate: { type: Date }
}, {
  timestamps: true
});

// Index for efficient queries
performanceSchema.index({ employee: 1, reviewType: 1 });
performanceSchema.index({ reviewer: 1 });
performanceSchema.index({ status: 1 });
performanceSchema.index({ 'reviewPeriod.startDate': -1 });

module.exports = mongoose.model('Performance', performanceSchema);