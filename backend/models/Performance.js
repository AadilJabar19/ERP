const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  reviewType: { 
    type: String, 
    enum: ['annual', 'quarterly', 'probation', 'project-based'], 
    default: 'annual' 
  },
  goals: [{
    title: { type: String, required: true },
    description: String,
    targetDate: Date,
    status: { type: String, enum: ['not-started', 'in-progress', 'completed', 'overdue'], default: 'not-started' },
    achievement: { type: Number, min: 0, max: 100, default: 0 },
    comments: String
  }],
  competencies: [{
    name: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: String
  }],
  overallRating: { type: Number, min: 1, max: 5, required: true },
  strengths: [String],
  areasForImprovement: [String],
  developmentPlan: [{
    skill: String,
    action: String,
    timeline: String,
    resources: String
  }],
  employeeComments: String,
  reviewerComments: String,
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'reviewed', 'acknowledged', 'finalized'], 
    default: 'draft' 
  },
  nextReviewDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Performance', performanceSchema);