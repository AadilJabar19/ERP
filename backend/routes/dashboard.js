const express = require('express');
const Employee = require('../models/Employee');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Project = require('../models/Project');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Dashboard Analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    // Basic counts
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const totalProducts = await Product.countDocuments({ status: 'active' });
    const totalCustomers = await Customer.countDocuments({ status: 'active' });
    const totalProjects = await Project.countDocuments();
    
    // Sales data
    const totalSales = await Sale.countDocuments();
    const totalRevenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    // Recent activity
    const recentSales = await Sale.find()
      .populate('customer', 'companyName')
      .sort({ saleDate: -1 })
      .limit(5);
    
    const recentLeads = await Lead.find()
      .populate('assignedTo', 'personalInfo.firstName personalInfo.lastName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Monthly trends
    const monthlySales = await Sale.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' }
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' }
              ]}
            ]
          },
          sales: 1,
          revenue: 1
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);
    
    // Department distribution
    const departmentStats = await Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$employment.department', count: { $sum: 1 } } }
    ]);
    
    // Project status
    const projectStats = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Lead status
    const leadStats = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Low stock alerts
    const lowStockProducts = await Product.find({
      status: 'active',
      $expr: { $lte: ['$totalQuantity', '$inventory.stockLevels.reorderPoint'] }
    }).limit(5);
    
    // Today's attendance
    const today = new Date().toDateString();
    const todayAttendance = await Attendance.find({
      date: new Date(today)
    }).populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId');
    
    // Upcoming events
    const upcomingEvents = await Event.find({
      startDate: { $gte: new Date() }
    }).sort({ startDate: 1 }).limit(5);
    
    res.json({
      overview: {
        totalEmployees,
        totalProducts,
        totalCustomers,
        totalProjects,
        totalSales,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentActivity: {
        recentSales,
        recentLeads
      },
      trends: {
        monthlySales: monthlySales.reverse(),
        departmentStats,
        projectStats,
        leadStats
      },
      alerts: {
        lowStockProducts,
        todayAttendance: {
          present: todayAttendance.filter(a => a.status === 'present').length,
          late: todayAttendance.filter(a => a.status === 'late').length,
          total: todayAttendance.length
        }
      },
      upcomingEvents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;