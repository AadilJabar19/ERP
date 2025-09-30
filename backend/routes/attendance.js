const express = require('express');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Get attendance records
router.get('/', auth, async (req, res) => {
  try {
    const { date, employee } = req.query;
    let query = {};
    
    if (date) query.date = new Date(date);
    if (employee) query.employee = employee;
    
    const attendance = await Attendance.find(query).populate('employee', 'name employeeId');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check in
router.post('/checkin', auth, async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toDateString();
    
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: new Date(today)
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const attendance = new Attendance({
      employee: employee._id,
      date: new Date(today),
      checkIn: new Date(),
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Check out
router.post('/checkout', auth, async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toDateString();
    
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: new Date(today)
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out' });
    }

    attendance.checkOut = new Date();
    attendance.workingHours = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
    
    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark attendance (admin/manager)
router.post('/', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get attendance analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const [analytics] = await Attendance.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalRecords: { $sum: 1 },
                avgWorkingHours: { $avg: '$workingHours' },
                overallAttendanceRate: { $avg: { $cond: [{ $ne: ['$status', 'absent'] }, 100, 0] } },
                totalLateArrivals: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
              }
            }
          ],
          statusStats: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          dailyStats: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
                late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
                absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } }
              }
            },
            { $sort: { _id: -1 } },
            { $limit: 30 }
          ],
          departmentStats: [
            { $lookup: { from: 'employees', localField: 'employee', foreignField: '_id', as: 'empInfo' } },
            { $unwind: '$empInfo' },
            {
              $group: {
                _id: '$empInfo.employment.department',
                avgWorkingHours: { $avg: '$workingHours' },
                attendanceRate: { $avg: { $cond: [{ $ne: ['$status', 'absent'] }, 100, 0] } }
              }
            }
          ]
        }
      }
    ]);
    
    const overview = analytics.overview[0] || {};
    
    res.json({
      totalRecords: overview.totalRecords || 0,
      statusStats: analytics.statusStats,
      avgWorkingHours: overview.avgWorkingHours || 0,
      dailyStats: analytics.dailyStats,
      departmentStats: analytics.departmentStats,
      overallAttendanceRate: overview.overallAttendanceRate || 0,
      totalLateArrivals: overview.totalLateArrivals || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;