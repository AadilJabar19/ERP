const express = require('express');
const { Integration, WebhookLog } = require('../models/Integration');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Get all integrations
router.get('/', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const integrations = await Integration.find().select('-config.apiSecret');
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create integration
router.post('/', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const integration = new Integration(req.body);
    await integration.save();
    res.status(201).json(integration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Test integration
router.post('/:id/test', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);
    
    // Simulate API test based on provider
    const testResult = await testIntegration(integration);
    
    integration.syncStatus = testResult.success ? 'success' : 'failed';
    integration.lastSync = new Date();
    await integration.save();
    
    res.json(testResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Webhook endpoint
router.post('/webhook/:integrationId', async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.integrationId);
    if (!integration || !integration.isActive) {
      return res.status(404).json({ message: 'Integration not found or inactive' });
    }

    const webhookLog = new WebhookLog({
      integration: integration._id,
      event: req.headers['x-event-type'] || 'unknown',
      payload: req.body,
      status: 'pending'
    });

    // Process webhook based on integration type
    const result = await processWebhook(integration, req.body);
    
    webhookLog.status = result.success ? 'processed' : 'failed';
    webhookLog.response = result;
    await webhookLog.save();

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sync data
router.post('/:id/sync', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);
    const syncResult = await syncIntegrationData(integration);
    
    integration.lastSync = new Date();
    integration.syncStatus = syncResult.success ? 'success' : 'failed';
    await integration.save();
    
    res.json(syncResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Helper functions
async function testIntegration(integration) {
  switch (integration.provider) {
    case 'hubspot':
      return { success: true, message: 'HubSpot connection successful' };
    case 'quickbooks':
      return { success: true, message: 'QuickBooks connection successful' };
    case 'slack':
      return { success: true, message: 'Slack connection successful' };
    default:
      return { success: false, message: 'Unknown provider' };
  }
}

async function processWebhook(integration, payload) {
  // Process webhook based on integration type
  return { success: true, processed: payload };
}

async function syncIntegrationData(integration) {
  // Sync data based on integration type
  return { success: true, synced: 0 };
}

module.exports = router;