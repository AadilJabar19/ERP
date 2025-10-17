const express = require('express');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all tickets
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, assignedTo } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    
    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create ticket
router.post('/', auth, async (req, res) => {
  try {
    const ticket = new Ticket({
      ...req.body,
      createdBy: req.user._id,
      ticketNumber: `TK-${Date.now()}`
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    ticket.comments.push({
      user: req.user._id,
      message: req.body.message
    });
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update ticket status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const updateData = { status: req.body.status };
    if (req.body.status === 'resolved') {
      updateData.resolvedAt = new Date();
      updateData.resolution = req.body.resolution;
    }
    
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const [statusStats, categoryStats, priorityStats] = await Promise.all([
      Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }])
    ]);
    
    res.json({ statusStats, categoryStats, priorityStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;