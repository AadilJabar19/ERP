const express = require('express');
const SystemConfig = require('../models/SystemConfig');
const UserSession = require('../models/UserSession');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// System Configuration Routes
router.get('/config', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category, isActive: true } : { isActive: true };
    const configs = await SystemConfig.find(query).sort({ category: 1, key: 1 });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/config/:key', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const config = await SystemConfig.findOneAndUpdate(
      { key: req.params.key },
      { 
        value: req.body.value, 
        lastModifiedBy: req.user._id 
      },
      { new: true }
    );
    res.json(config);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Session Management
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await UserSession.find({ 
      userId: req.user._id, 
      isActive: true 
    }).sort({ lastActivity: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/sessions/:sessionId', auth, async (req, res) => {
  try {
    await UserSession.findOneAndUpdate(
      { _id: req.params.sessionId, userId: req.user._id },
      { isActive: false }
    );
    res.json({ message: 'Session terminated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// System Health Check
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };
    res.json(health);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize default configurations
router.post('/init', auth, roleAuth(['admin']), async (req, res) => {
  try {
    await SystemConfig.initializeDefaults();
    res.json({ message: 'System initialized with default configurations' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;