const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        name: mongoose.connection.name
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      version: '1.0.0'
    };
    
    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// Detailed system info (admin only)
router.get('/detailed', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    const detailed = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        pid: process.pid
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        collections: collections.map(c => c.name)
      },
      memory: process.memoryUsage(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT
      }
    };
    
    res.status(200).json(detailed);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

module.exports = router;
