const express = require('express');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Get all payroll records
router.get('/', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { employee, month, year, status } = req.query;
    const query = {};
    
    if (employee) query.employee = employee;
    if (status) query.status = status;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query['payPeriod.startDate'] = { $gte: startDate, $lte: endDate };
    }
    
    const payrolls = await Payroll.find(query)
      .populate('employee', 'personalInfo employeeId employment')
      .sort({ 'payPeriod.startDate': -1 });
      
    res.json({ payrolls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payroll record
router.post('/', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { employee, payPeriod, earnings, deductions } = req.body;
    
    // Calculate net pay
    const totalEarnings = (earnings.baseSalary || 0) + (earnings.overtime || 0) + (earnings.bonuses || 0);
    const netPay = totalEarnings - (deductions || 0);
    
    const payroll = new Payroll({
      employee,
      payPeriod,
      earnings,
      totalDeductions: deductions || 0,
      netPay,
      processedBy: req.user._id,
      status: 'processed'
    });
    
    await payroll.save();
    await payroll.populate('employee', 'personalInfo employeeId employment');
    
    res.status(201).json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payroll status
router.patch('/:id/status', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { status } = req.body;
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status, paidDate: status === 'paid' ? new Date() : undefined },
      { new: true }
    ).populate('employee', 'personalInfo employeeId employment');
    
    res.json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get payroll analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const [totalPayroll, statusStats, monthlyStats] = await Promise.all([
      Payroll.aggregate([
        { $group: { _id: null, total: { $sum: '$netPay' }, count: { $sum: 1 } } }
      ]),
      Payroll.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$netPay' } } }
      ]),
      Payroll.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$payPeriod.startDate' },
              month: { $month: '$payPeriod.startDate' }
            },
            total: { $sum: '$netPay' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);
    
    res.json({
      totalPayroll: totalPayroll[0]?.total || 0,
      totalRecords: totalPayroll[0]?.count || 0,
      statusStats,
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;