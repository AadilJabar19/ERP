const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const { status, manager } = req.query;
    let query = {};
    if (status) query.status = status;
    if (manager) query.manager = manager;
    
    const projects = await Project.find(query)
      .populate('manager', 'name employeeId')
      .populate('team', 'name employeeId');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create project
router.post('/', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update project
router.put('/:id', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get project analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalBudget = await Project.aggregate([
      { $group: { _id: null, total: { $sum: '$budget' } } }
    ]);
    
    const avgProgress = await Project.aggregate([
      { $group: { _id: null, avg: { $avg: '$progress' } } }
    ]);
    
    const statusStats = await Project.aggregate([
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 },
        totalBudget: { $sum: '$budget' }
      }}
    ]);
    
    const priorityStats = await Project.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    const progressStats = await Project.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$progress', 25] }, then: '0-25%' },
                { case: { $lt: ['$progress', 50] }, then: '25-50%' },
                { case: { $lt: ['$progress', 75] }, then: '50-75%' },
                { case: { $lt: ['$progress', 100] }, then: '75-99%' }
              ],
              default: '100%'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      totalProjects,
      totalBudget: totalBudget[0]?.total || 0,
      avgProgress: avgProgress[0]?.avg || 0,
      statusStats,
      priorityStats,
      progressStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;