const express = require('express');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Get payroll records
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
      .populate('employee', 'name employeeId department')
      .sort({ 'payPeriod.startDate': -1 });
      
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate payroll for employee
router.post('/calculate', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.body;
    
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Get attendance records for the period
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
    
    const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.workingHours || 0), 0);
    const standardHours = 160; // 40 hours/week * 4 weeks
    const overtimeHours = Math.max(0, totalHours - standardHours);
    const regularHours = Math.min(totalHours, standardHours);
    
    const baseSalary = employee.salary;
    const hourlyRate = baseSalary / standardHours;
    const overtimeRate = hourlyRate * 1.5;
    
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * overtimeRate;
    const grossPay = regularPay + overtimePay;
    
    // Calculate deductions (simplified)
    const federalTax = grossPay * 0.12;
    const stateTax = grossPay * 0.05;
    const socialSecurity = grossPay * 0.062;
    const medicare = grossPay * 0.0145;
    
    const totalDeductions = federalTax + stateTax + socialSecurity + medicare;
    const netPay = grossPay - totalDeductions;
    
    const payroll = new Payroll({
      employee: employeeId,
      payPeriod: { startDate, endDate },
      baseSalary,
      hoursWorked: totalHours,
      overtimeHours,
      grossPay,
      totalDeductions,
      netPay,
      taxCalculations: {
        federalTax,
        stateTax,
        socialSecurity,
        medicare
      },
      status: 'calculated'
    });
    
    await payroll.save();
    res.status(201).json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve payroll
router.patch('/:id/approve', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    res.json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Process payment
router.patch('/:id/pay', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', payDate: new Date() },
      { new: true }
    );
    res.json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;