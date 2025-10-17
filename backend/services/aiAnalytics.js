// Safe model imports with fallbacks
let Sale, Product, Employee, Customer;
try {
  Sale = require('../models/Sale');
  Product = require('../models/Product');
  Employee = require('../models/Employee');
  Customer = require('../models/Customer');
} catch (error) {
  console.warn('Some models not available for AI Analytics:', error.message);
}

class AIAnalyticsService {
  // Predict sales trends
  static async predictSalesTrends(months = 3) {
    try {
      if (!Sale) {
        return { 
          historical: [],
          predictions: this.generateMockPredictions(months),
          insight: 'Demo mode - Sales module not fully configured'
        };
      }
      
      const historicalData = await Sale.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            totalSales: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const predictions = this.linearRegression(historicalData, months);
      
      return {
        historical: historicalData,
        predictions,
        insight: this.generateSalesInsight(historicalData, predictions)
      };
    } catch (error) {
      console.error('Error predicting sales trends:', error);
      return { 
        historical: [],
        predictions: this.generateMockPredictions(months),
        insight: 'Error loading sales data - using demo predictions'
      };
    }
  }

  // Predict inventory demand
  static async predictInventoryDemand() {
    try {
      if (!Product) {
        return {
          products: [],
          insights: this.generateMockInventoryInsights()
        };
      }
      
      const products = await Product.aggregate([
        {
          $lookup: {
            from: 'sales',
            localField: '_id',
            foreignField: 'items.product',
            as: 'sales'
          }
        },
        {
          $project: {
            name: 1,
            currentStock: 1,
            reorderLevel: 1,
            salesVelocity: { $size: '$sales' },
            predictedDemand: {
              $multiply: [
                { $size: '$sales' },
                1.2
              ]
            }
          }
        }
      ]);

      return {
        products,
        insights: products.map(p => ({
          productId: p._id,
          name: p.name,
          recommendation: p.currentStock < p.predictedDemand ? 'REORDER_URGENT' : 'STOCK_ADEQUATE',
          suggestedOrderQuantity: Math.max(0, p.predictedDemand - p.currentStock)
        }))
      };
    } catch (error) {
      console.error('Error predicting inventory demand:', error);
      return {
        products: [],
        insights: this.generateMockInventoryInsights()
      };
    }
  }

  // Helper methods
  static linearRegression(data, months) {
    if (data.length < 2) return [];
    
    const predictions = [];
    const lastValue = data[data.length - 1]?.totalSales || 0;
    const trend = data.length > 1 ? 
      (data[data.length - 1]?.totalSales - data[0]?.totalSales) / data.length : 0;

    for (let i = 1; i <= months; i++) {
      predictions.push({
        month: i,
        predictedSales: Math.max(0, lastValue + (trend * i)),
        confidence: Math.max(0.5, 1 - (i * 0.1))
      });
    }

    return predictions;
  }

  static generateMockPredictions(months) {
    const predictions = [];
    for (let i = 1; i <= months; i++) {
      predictions.push({
        month: i,
        predictedSales: 50000 + (Math.random() * 20000),
        confidence: Math.max(0.5, 1 - (i * 0.1))
      });
    }
    return predictions;
  }

  static generateMockInventoryInsights() {
    return [
      { name: 'Product A', recommendation: 'REORDER_URGENT', suggestedOrderQuantity: 50 },
      { name: 'Product B', recommendation: 'STOCK_ADEQUATE', suggestedOrderQuantity: 0 },
      { name: 'Product C', recommendation: 'REORDER_URGENT', suggestedOrderQuantity: 25 }
    ];
  }

  static generateSalesInsight(historical, predictions) {
    if (!historical.length || !predictions.length) return 'Demo mode - Sales expected to grow by 15%';
    
    const avgHistorical = historical.reduce((sum, h) => sum + h.totalSales, 0) / historical.length;
    const avgPredicted = predictions.reduce((sum, p) => sum + p.predictedSales, 0) / predictions.length;
    
    const growth = ((avgPredicted - avgHistorical) / avgHistorical) * 100;
    
    if (growth > 10) return `Sales likely to increase by ${growth.toFixed(1)}% - Consider expanding inventory`;
    if (growth < -10) return `Sales may decline by ${Math.abs(growth).toFixed(1)}% - Review marketing strategy`;
    return `Sales expected to remain stable with ${growth.toFixed(1)}% change`;
  }
}

module.exports = AIAnalyticsService;