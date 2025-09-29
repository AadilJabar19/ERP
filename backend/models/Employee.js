const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
    nationality: String,
    bloodGroup: String,
    profilePhoto: String
  },
  contactInfo: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },
  employment: {
    department: { type: String, required: true },
    position: { type: String, required: true },
    employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'intern'], default: 'full-time' },
    workLocation: { type: String, enum: ['office', 'remote', 'hybrid'], default: 'office' },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    hireDate: { type: Date, default: Date.now },
    probationEndDate: Date,
    contractEndDate: Date,
    workingHours: { type: Number, default: 40 },
    shiftPattern: String
  },
  compensation: {
    baseSalary: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    payFrequency: { type: String, enum: ['weekly', 'bi-weekly', 'monthly'], default: 'monthly' },
    overtimeRate: { type: Number, default: 1.5 },
    benefits: [{
      type: String,
      description: String,
      value: Number
    }]
  },
  documents: [{
    type: { type: String, required: true },
    fileName: String,
    filePath: String,
    uploadDate: { type: Date, default: Date.now },
    expiryDate: Date
  }],
  skills: [{
    name: String,
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
    certifiedDate: Date,
    expiryDate: Date
  }],
  leaveBalance: {
    annual: { type: Number, default: 20 },
    sick: { type: Number, default: 10 },
    personal: { type: Number, default: 5 },
    maternity: { type: Number, default: 90 },
    paternity: { type: Number, default: 15 }
  },
  status: { type: String, enum: ['active', 'inactive', 'terminated', 'on-leave'], default: 'active' },
  terminationDate: Date,
  terminationReason: String
}, { timestamps: true });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for name (backward compatibility)
employeeSchema.virtual('name').get(function() {
  return this.fullName;
});

// Virtual for email (backward compatibility)
employeeSchema.virtual('email').get(function() {
  return this.contactInfo.email;
});

// Virtual for phone (backward compatibility)
employeeSchema.virtual('phone').get(function() {
  return this.contactInfo.phone;
});

// Virtual for department (backward compatibility)
employeeSchema.virtual('department').get(function() {
  return this.employment.department;
});

// Virtual for position (backward compatibility)
employeeSchema.virtual('position').get(function() {
  return this.employment.position;
});

// Virtual for salary (backward compatibility)
employeeSchema.virtual('salary').get(function() {
  return this.compensation.baseSalary;
});

// Virtual for hireDate (backward compatibility)
employeeSchema.virtual('hireDate').get(function() {
  return this.employment.hireDate;
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);