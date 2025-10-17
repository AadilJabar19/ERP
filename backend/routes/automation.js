const express = require('express');
const { Automation, Workflow } = require('../models/Automation');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Automation routes
router.get('/automations', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const automations = await Automation.find().sort({ createdAt: -1 });
    res.json(automations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/automations', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const automation = new Automation(req.body);
    await automation.save();
    res.status(201).json(automation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/automations/:id/execute', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    const result = await executeAutomation(automation);
    
    automation.lastRun = new Date();
    automation.runCount += 1;
    await automation.save();
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Workflow routes
router.get('/workflows', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const workflows = await Workflow.find()
      .populate('steps.assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/workflows', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const workflow = new Workflow(req.body);
    await workflow.save();
    res.status(201).json(workflow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Execute automation
async function executeAutomation(automation) {
  const results = [];
  
  for (const action of automation.actions) {
    try {
      let result;
      switch (action.type) {
        case 'email':
          result = await sendEmail(action.config);
          break;
        case 'sms':
          result = await sendSMS(action.config);
          break;
        case 'webhook':
          result = await callWebhook(action.config);
          break;
        case 'update_record':
          result = await updateRecord(action.config);
          break;
        default:
          result = { success: false, message: 'Unknown action type' };
      }
      results.push(result);
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  
  return { success: true, results };
}

// Helper functions
async function sendEmail(config) {
  console.log('Sending email:', config);
  return { success: true, message: 'Email sent' };
}

async function sendSMS(config) {
  console.log('Sending SMS:', config);
  return { success: true, message: 'SMS sent' };
}

async function callWebhook(config) {
  console.log('Calling webhook:', config);
  return { success: true, message: 'Webhook called' };
}

async function updateRecord(config) {
  console.log('Updating record:', config);
  return { success: true, message: 'Record updated' };
}

module.exports = router;