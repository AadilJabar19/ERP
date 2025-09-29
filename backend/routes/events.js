const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Get events
router.get('/', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    let query = {};
    
    if (start && end) {
      query.startDate = { $gte: new Date(start), $lte: new Date(end) };
    }
    
    const events = await Event.find(query).populate('attendees', 'name employeeId');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      createdBy: req.user._id
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update event
router.put('/:id', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;