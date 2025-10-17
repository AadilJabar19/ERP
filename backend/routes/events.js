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

// Get event analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const [eventStats] = await Event.aggregate([
      {
        $facet: {
          totalCount: [{ $count: 'total' }],
          typeStats: [{ $group: { _id: '$type', count: { $sum: 1 } } }],
          monthlyStats: [
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' }
              ]}
            ]
          },
          count: 1
        }
      },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
          ]
        }
      }
    ]);
    
    res.json({
      totalEvents: eventStats.totalCount[0]?.total || 0,
      eventTypeStats: eventStats.typeStats,
      monthlyStats: eventStats.monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk upload events
router.post('/bulk', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { events } = req.body;
    const results = [];
    
    for (const eventData of events) {
      const event = new Event({
        title: eventData.title,
        description: eventData.description,
        startDate: `${eventData.startDate}T${eventData.startTime}`,
        endDate: `${eventData.endDate}T${eventData.endTime}`,
        type: eventData.type || 'meeting',
        priority: eventData.priority || 'medium',
        location: eventData.location,
        createdBy: req.user._id
      });
      await event.save();
      results.push(event);
    }
    
    res.status(201).json({ message: `Successfully imported ${results.length} events`, events: results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;