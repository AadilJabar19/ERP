const express = require('express');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Get all employees
router.get('/', auth, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create employee
router.post('/', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    // Transform old format to new format
    const employeeData = {
      employeeId: req.body.employeeId,
      personalInfo: {
        firstName: req.body.name?.split(' ')[0] || req.body.firstName || 'Unknown',
        lastName: req.body.name?.split(' ').slice(1).join(' ') || req.body.lastName || 'User'
      },
      contactInfo: {
        email: req.body.email,
        phone: req.body.phone
      },
      employment: {
        department: req.body.department,
        position: req.body.position
      },
      compensation: {
        baseSalary: req.body.salary
      }
    };
    
    const employee = new Employee(employeeData);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.error('Employee creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update employee
router.put('/:id', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete employee
router.delete('/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;