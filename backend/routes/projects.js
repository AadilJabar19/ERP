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
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const totalBudget = await Project.aggregate([
      { $group: { _id: null, total: { $sum: '$budget' } } }
    ]);
    
    res.json({
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget: totalBudget[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;