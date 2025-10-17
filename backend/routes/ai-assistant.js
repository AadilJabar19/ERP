const express = require('express');
const AIAssistantService = require('../services/aiAssistant');
const ChatHistory = require('../models/ChatHistory');
const auth = require('../middleware/auth');
const router = express.Router();

// Natural language query endpoint
router.post('/query', auth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Query is required' });
    }
    
    const response = await AIAssistantService.processNaturalQuery(query, req.user._id);
    
    // Save chat messages to database
    let chatHistory = await ChatHistory.findOne({ userId: req.user._id });
    if (!chatHistory) {
      chatHistory = new ChatHistory({ userId: req.user._id, messages: [] });
    }
    
    chatHistory.messages.push(
      { type: 'user', content: query, timestamp: new Date() },
      { type: 'ai', content: response.answer, messageType: response.type, timestamp: new Date() }
    );
    
    await chatHistory.save();
    
    res.json(response);
  } catch (error) {
    console.error('AI Query Error:', error);
    res.status(500).json({ 
      type: 'error',
      answer: 'Sorry, I encountered an error processing your request.',
      message: error.message 
    });
  }
});

// Get AI recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const recommendations = await AIAssistantService.getRecommendations(req.user._id);
    res.json({ recommendations });
  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Anomaly detection
router.post('/detect-anomalies', auth, async (req, res) => {
  try {
    const { module, data } = req.body;
    if (!module || !data) {
      return res.status(400).json({ message: 'Module and data are required' });
    }
    const anomalies = await AIAssistantService.detectAnomalies(module, data);
    res.json({ anomalies });
  } catch (error) {
    console.error('Anomaly Detection Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Price optimization
router.post('/optimize-price', auth, async (req, res) => {
  try {
    const { productId, marketData } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    const optimization = await AIAssistantService.optimizePrice(productId, marketData || {});
    res.json(optimization);
  } catch (error) {
    console.error('Price Optimization Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get chat history
router.get('/chat-history', auth, async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({ userId: req.user._id });
    res.json({ messages: chatHistory?.messages || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear chat history
router.delete('/chat-history', auth, async (req, res) => {
  try {
    await ChatHistory.findOneAndDelete({ userId: req.user._id });
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Quick insights endpoint
router.get('/insights', auth, async (req, res) => {
  try {
    const insights = {
      summary: 'AI Assistant is ready to help with your ERP queries',
      capabilities: [
        'Natural language queries about employees, inventory, customers',
        'Smart recommendations based on your data',
        'Anomaly detection for unusual patterns',
        'Price optimization suggestions'
      ],
      examples: [
        'How many employees do we have?',
        'Show me products with low stock',
        'What projects are overdue?',
        'How many pending leave requests?'
      ]
    };
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;