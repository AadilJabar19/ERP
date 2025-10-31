const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const User = require('../models/User');
const Employee = require('../models/Employee');
const Product = require('../models/Product');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const Project = require('../models/Project');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const Leave = require('../models/Leave');
const Invoice = require('../models/Invoice');

const addIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/claryx-erp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    console.log('\n📊 Adding indexes to collections...\n');

    // User indexes
    console.log('Adding User indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isActive: 1 });
    await User.collection.createIndex({ lastLogin: -1 });
    await User.collection.createIndex({ createdAt: -1 });
    console.log('✓ User indexes added');

    // Employee indexes
    console.log('Adding Employee indexes...');
    await Employee.collection.createIndex({ employeeId: 1 }, { unique: true });
    await Employee.collection.createIndex({ 'personalInfo.email': 1 });
    await Employee.collection.createIndex({ 'employment.department': 1 });
    await Employee.collection.createIndex({ 'employment.position': 1 });
    await Employee.collection.createIndex({ status: 1 });
    await Employee.collection.createIndex({ 'employment.hireDate': -1 });
    await Employee.collection.createIndex({ userId: 1 });
    // Compound index for common queries
    await Employee.collection.createIndex({ status: 1, 'employment.department': 1 });
    console.log('✓ Employee indexes added');

    // Product indexes
    console.log('Adding Product indexes...');
    await Product.collection.createIndex({ productId: 1 }, { unique: true });
    await Product.collection.createIndex({ sku: 1 }, { unique: true });
    await Product.collection.createIndex({ name: 1 });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ status: 1 });
    await Product.collection.createIndex({ 'pricing.sellingPrice': 1 });
    await Product.collection.createIndex({ totalQuantity: 1 });
    // Compound index for low stock queries
    await Product.collection.createIndex({ 
      status: 1, 
      totalQuantity: 1, 
      'inventory.stockLevels.reorderPoint': 1 
    });
    // Text index for search
    await Product.collection.createIndex({ name: 'text', description: 'text' });
    console.log('✓ Product indexes added');

    // Lead indexes
    console.log('Adding Lead indexes...');
    await Lead.collection.createIndex({ companyName: 1 });
    await Lead.collection.createIndex({ status: 1 });
    await Lead.collection.createIndex({ priority: 1 });
    await Lead.collection.createIndex({ source: 1 });
    await Lead.collection.createIndex({ assignedTo: 1 });
    await Lead.collection.createIndex({ createdAt: -1 });
    // Compound index for pipeline queries
    await Lead.collection.createIndex({ status: 1, priority: 1 });
    await Lead.collection.createIndex({ assignedTo: 1, status: 1 });
    console.log('✓ Lead indexes added');

    // Customer indexes
    console.log('Adding Customer indexes...');
    await Customer.collection.createIndex({ companyName: 1 });
    await Customer.collection.createIndex({ 'contactInfo.email': 1 });
    await Customer.collection.createIndex({ status: 1 });
    await Customer.collection.createIndex({ createdAt: -1 });
    // Text index for search
    await Customer.collection.createIndex({ companyName: 'text' });
    console.log('✓ Customer indexes added');

    // Sale indexes
    console.log('Adding Sale indexes...');
    await Sale.collection.createIndex({ customer: 1 });
    await Sale.collection.createIndex({ saleDate: -1 });
    await Sale.collection.createIndex({ status: 1 });
    await Sale.collection.createIndex({ totalAmount: -1 });
    // Compound index for analytics
    await Sale.collection.createIndex({ saleDate: -1, status: 1 });
    console.log('✓ Sale indexes added');

    // Project indexes
    console.log('Adding Project indexes...');
    await Project.collection.createIndex({ projectName: 1 });
    await Project.collection.createIndex({ status: 1 });
    await Project.collection.createIndex({ priority: 1 });
    await Project.collection.createIndex({ startDate: -1 });
    await Project.collection.createIndex({ endDate: -1 });
    await Project.collection.createIndex({ 'team': 1 });
    // Compound index for active projects
    await Project.collection.createIndex({ status: 1, priority: 1 });
    console.log('✓ Project indexes added');

    // Attendance indexes
    console.log('Adding Attendance indexes...');
    await Attendance.collection.createIndex({ employee: 1 });
    await Attendance.collection.createIndex({ date: -1 });
    await Attendance.collection.createIndex({ status: 1 });
    // Compound index for employee attendance history
    await Attendance.collection.createIndex({ employee: 1, date: -1 });
    // Compound index for daily reports
    await Attendance.collection.createIndex({ date: -1, status: 1 });
    console.log('✓ Attendance indexes added');

    // Event indexes
    console.log('Adding Event indexes...');
    await Event.collection.createIndex({ startDate: 1 });
    await Event.collection.createIndex({ endDate: 1 });
    await Event.collection.createIndex({ type: 1 });
    await Event.collection.createIndex({ 'attendees': 1 });
    // Compound index for calendar queries
    await Event.collection.createIndex({ startDate: 1, endDate: 1 });
    console.log('✓ Event indexes added');

    // Leave indexes
    console.log('Adding Leave indexes...');
    await Leave.collection.createIndex({ employee: 1 });
    await Leave.collection.createIndex({ status: 1 });
    await Leave.collection.createIndex({ leaveType: 1 });
    await Leave.collection.createIndex({ startDate: -1 });
    // Compound index for employee leave history
    await Leave.collection.createIndex({ employee: 1, status: 1 });
    await Leave.collection.createIndex({ employee: 1, startDate: -1 });
    console.log('✓ Leave indexes added');

    // Invoice indexes
    console.log('Adding Invoice indexes...');
    await Invoice.collection.createIndex({ customer: 1 });
    await Invoice.collection.createIndex({ invoiceNumber: 1 }, { unique: true, sparse: true });
    await Invoice.collection.createIndex({ status: 1 });
    await Invoice.collection.createIndex({ dueDate: 1 });
    await Invoice.collection.createIndex({ createdAt: -1 });
    // Compound index for overdue invoices
    await Invoice.collection.createIndex({ status: 1, dueDate: 1 });
    console.log('✓ Invoice indexes added');

    console.log('\n✅ All indexes added successfully!');
    console.log('\n📊 Index Statistics:');
    
    // Get index information
    const collections = [
      { name: 'User', model: User },
      { name: 'Employee', model: Employee },
      { name: 'Product', model: Product },
      { name: 'Lead', model: Lead },
      { name: 'Customer', model: Customer },
      { name: 'Sale', model: Sale },
      { name: 'Project', model: Project },
      { name: 'Attendance', model: Attendance },
      { name: 'Event', model: Event },
      { name: 'Leave', model: Leave },
      { name: 'Invoice', model: Invoice },
    ];

    for (const { name, model } of collections) {
      const indexes = await model.collection.getIndexes();
      console.log(`\n${name}: ${Object.keys(indexes).length} indexes`);
      Object.keys(indexes).forEach(indexName => {
        console.log(`  - ${indexName}`);
      });
    }

  } catch (error) {
    console.error('Error adding indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
    process.exit(0);
  }
};

addIndexes();
