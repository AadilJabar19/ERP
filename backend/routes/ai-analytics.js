const express = require('express');
const AIAnalyticsService = require('../services/aiAnalytics');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Sales predictions
router.get('/sales-trends', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { months = 3 } = req.query;
    const predictions = await AIAnalyticsService.predictSalesTrends(parseInt(months));
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Inventory demand predictions
router.get('/inventory-demand', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const predictions = await AIAnalyticsService.predictInventoryDemand();
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Comprehensive AI insights
router.get('/insights', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const [salesTrends, inventoryDemand] = await Promise.all([
      AIAnalyticsService.predictSalesTrends(3),
      AIAnalyticsService.predictInventoryDemand()
    ]);

    res.json({
      salesTrends,
      inventoryDemand,
      generatedAt: new Date(),
      recommendations: [
        'Review top-performing products for expansion opportunities',
        'Monitor low-stock items for potential stockouts',
        'Consider seasonal trends in demand forecasting'
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;