const express = require('express');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Audit log helper
const logAdminAction = async (adminId, action, target, details) => {
  console.log(`[AUDIT] Admin ${adminId} performed ${action} on ${target}: ${details}`);
};

// User Management
router.get('/users', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/users/:id/status', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    await logAdminAction(req.user._id, 'STATUS_CHANGE', 'USER', `${user.email} ${isActive ? 'activated' : 'deactivated'}`);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/users/:id/role', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const oldUser = await User.findById(req.params.id);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    await logAdminAction(req.user._id, 'ROLE_CHANGE', 'USER', `${user.email} role changed from ${oldUser.role} to ${role}`);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk user operations
router.post('/users/bulk-action', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const { userIds, action, value } = req.body;
    let updateField = {};
    
    if (action === 'activate') updateField.isActive = true;
    else if (action === 'deactivate') updateField.isActive = false;
    else if (action === 'change-role') updateField.role = value;
    
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateField
    );
    
    await logAdminAction(req.user._id, 'BULK_ACTION', 'USERS', `${action} applied to ${userIds.length} users`);
    res.json({ modified: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await User.findByIdAndDelete(req.params.id);
    await logAdminAction(req.user._id, 'DELETE', 'USER', `${user.email} deleted`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Enhanced System Analytics
router.get('/analytics', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const [userStats, employeeStats, systemStats] = await Promise.all([
      User.aggregate([
        {
          $facet: {
            totalUsers: [{ $count: 'count' }],
            roleStats: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
            activeUsers: [{ $match: { isActive: true } }, { $count: 'count' }],
            recentLogins: [
              { $match: { lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
              { $count: 'count' }
            ]
          }
        }
      ]),
      Employee.aggregate([
        {
          $facet: {
            totalEmployees: [{ $count: 'count' }],
            departmentStats: [
              { $group: { _id: '$employment.department', count: { $sum: 1 } } }
            ]
          }
        }
      ]),
      Promise.all([
        Product.countDocuments(),
        Sale.countDocuments(),
        Attendance.countDocuments({ date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
      ])
    ]);

    const userAnalytics = userStats[0] || {};
    const employeeAnalytics = employeeStats[0] || {};
    const [totalProducts, totalSales, monthlyAttendance] = systemStats;

    res.json({
      users: {
        total: userAnalytics.totalUsers?.[0]?.count || 0,
        active: userAnalytics.activeUsers?.[0]?.count || 0,
        recentLogins: userAnalytics.recentLogins?.[0]?.count || 0,
        roleStats: userAnalytics.roleStats || []
      },
      employees: {
        total: employeeAnalytics.totalEmployees?.[0]?.count || 0,
        departmentStats: employeeAnalytics.departmentStats || []
      },
      system: {
        totalProducts,
        totalSales,
        monthlyAttendance,
        uptime: process.uptime()
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// System Health Check
router.get('/health', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const dbStatus = await User.findOne().lean() ? 'connected' : 'disconnected';
    
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbStatus,
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});

// Data Export
router.get('/export/:type', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const { type } = req.params;
    let data = [];
    
    switch (type) {
      case 'users':
        data = await User.find().select('-password').lean();
        break;
      case 'employees':
        data = await Employee.find().lean();
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }
    
    await logAdminAction(req.user._id, 'EXPORT', type.toUpperCase(), `${data.length} records`);
    res.json({ data, count: data.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enhanced System Settings
router.get('/settings', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    
    res.json({
      system: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
      },
      database: {
        connected: true,
        uri: process.env.MONGODB_URI ? 'configured' : 'default'
      },
      performance: {
        memoryUsage: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;