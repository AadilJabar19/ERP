const express = require('express');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Performance = require('../models/Performance');
const Training = require('../models/Training');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Employee Management Routes
router.get('/employees', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, status } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': new RegExp(search, 'i') },
        { 'personalInfo.lastName': new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') }
      ];
    }
    if (department) query['employment.department'] = department;
    if (status) query.status = status;
    
    const employees = await Employee.find(query)
      .populate('employment.manager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await Employee.countDocuments(query);
    
    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/employees', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/employees/:id', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/employees/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leave Management Routes
router.get('/leaves', auth, async (req, res) => {
  try {
    const { employee, status, leaveType, startDate, endDate } = req.query;
    const query = {};
    
    if (employee) query.employee = employee;
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const leaves = await Leave.find(query)
      .populate('employee', 'personalInfo employeeId employment.department')
      .populate('approvedBy', 'name')
      .sort({ appliedDate: -1 });
      
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/leaves', auth, async (req, res) => {
  try {
    const leave = new Leave({
      ...req.body,
      employee: req.body.employee || req.user._id
    });
    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/leaves/:id/approve', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { approved, rejectionReason } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: approved ? 'approved' : 'rejected',
        approvedBy: req.user._id,
        approvedDate: new Date(),
        ...(rejectionReason && { rejectionReason })
      },
      { new: true }
    );
    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Performance Management Routes
router.get('/performance', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { employee, reviewType, year } = req.query;
    const query = {};
    
    if (employee) query.employee = employee;
    if (reviewType) query.reviewType = reviewType;
    if (year) {
      const startYear = new Date(year, 0, 1);
      const endYear = new Date(year, 11, 31);
      query['reviewPeriod.startDate'] = { $gte: startYear, $lte: endYear };
    }
    
    const reviews = await Performance.find(query)
      .populate('employee', 'personalInfo employeeId employment')
      .populate('reviewer', 'personalInfo employeeId')
      .sort({ createdAt: -1 });
      
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/performance', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const review = new Performance({
      ...req.body,
      reviewer: req.user._id
    });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Training Management Routes
router.get('/training', auth, async (req, res) => {
  try {
    const { category, type, status } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (status) query.status = status;
    
    const trainings = await Training.find(query)
      .populate('participants.employee', 'personalInfo employeeId employment.department')
      .sort({ startDate: -1 });
      
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/training', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const training = new Training(req.body);
    await training.save();
    res.status(201).json(training);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/training/:id/enroll', auth, async (req, res) => {
  try {
    const { employeeId } = req.body;
    const training = await Training.findById(req.params.id);
    
    if (training.participants.length >= training.maxParticipants) {
      return res.status(400).json({ message: 'Training is full' });
    }
    
    training.participants.push({ employee: employeeId });
    await training.save();
    res.json(training);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ERP Users Management
router.get('/users', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('name email role isActive createdAt lastLogin')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await User.countDocuments({ role: { $ne: 'admin' } });
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/users/:id/convert-to-employee', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { employeeId, department, position, baseSalary } = req.body;
    
    const employee = new Employee({
      employeeId,
      personalInfo: {
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ').slice(1).join(' ') || 'N/A'
      },
      contactInfo: {
        email: user.email
      },
      employment: {
        department,
        position,
        hireDate: new Date()
      },
      compensation: {
        baseSalary: parseFloat(baseSalary)
      },
      userId: user._id
    });
    
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// HRM Analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const [employeeAnalytics, leaveStats, trainingStats] = await Promise.all([
      Employee.aggregate([
        { $match: { status: 'active' } },
        {
          $facet: {
            totalCount: [{ $count: 'count' }],
            departmentStats: [
              {
                $group: {
                  _id: '$employment.department',
                  count: { $sum: 1 },
                  avgSalary: { $avg: '$compensation.baseSalary' }
                }
              }
            ]
          }
        }
      ]),
      Leave.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Training.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);
    
    const totalEmployees = employeeAnalytics[0]?.totalCount[0]?.count || 0;
    const departmentStats = employeeAnalytics[0]?.departmentStats || [];
    
    res.json({
      totalEmployees,
      departmentStats,
      leaveStats,
      trainingStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;