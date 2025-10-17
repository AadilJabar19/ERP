import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AIInsights = () => {
  const { token, hasRole } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (token && hasRole(['admin', 'manager'])) {
      fetchInsights();
    }
  }, [token]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ai-analytics/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole(['admin', 'manager'])) {
    return (
      <div className="page-container">
        <div className="card">
          <h3>Access Denied</h3>
          <p>You don't have permission to view AI insights.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">
          <h3>🤖 Loading AI Insights...</h3>
          <p>Analyzing your data to generate predictive insights...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div>
      <div className="grid-stats" style={{ marginBottom: '30px' }}>
        <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2rem' }}>🤖</span>
            <div>
              <h4 style={{ margin: 0, color: 'white' }}>AI Predictions</h4>
              <p style={{ fontSize: '1.2rem', margin: '5px 0', color: 'white' }}>
                {insights?.salesTrends?.predictions?.length || 0} Forecasts
              </p>
            </div>
          </div>
        </div>
        
        <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2rem' }}>📈</span>
            <div>
              <h4 style={{ margin: 0, color: 'white' }}>Sales Trend</h4>
              <p style={{ fontSize: '1.2rem', margin: '5px 0', color: 'white' }}>
                {insights?.salesTrends?.insight?.includes('increase') ? '↗️ Growing' : 
                 insights?.salesTrends?.insight?.includes('decline') ? '↘️ Declining' : '➡️ Stable'}
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2rem' }}>📦</span>
            <div>
              <h4 style={{ margin: 0, color: 'white' }}>Inventory Alerts</h4>
              <p style={{ fontSize: '1.2rem', margin: '5px 0', color: 'white' }}>
                {insights?.inventoryDemand?.insights?.filter(i => i.recommendation === 'REORDER_URGENT').length || 0} Urgent
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2rem' }}>💡</span>
            <div>
              <h4 style={{ margin: 0, color: 'white' }}>Recommendations</h4>
              <p style={{ fontSize: '1.2rem', margin: '5px 0', color: 'white' }}>
                {insights?.recommendations?.length || 0} Actions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>🧠 AI-Generated Insights</h3>
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ color: '#2c3e50', marginBottom: '15px' }}>📊 Sales Forecast</h4>
          <p style={{ fontSize: '1.1rem', color: '#34495e', marginBottom: '10px' }}>
            {insights?.salesTrends?.insight || 'No sales insights available'}
          </p>
        </div>

        <h4>🎯 Recommended Actions</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {insights?.recommendations?.map((rec, index) => (
            <li key={index} style={{ 
              padding: '10px', 
              margin: '5px 0', 
              background: '#e8f5e8', 
              borderLeft: '4px solid #27ae60',
              borderRadius: '4px'
            }}>
              💡 {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderSalesForecasting = () => {
    const salesData = insights?.salesTrends?.historical?.map(h => ({
      month: `${h._id.year}-${h._id.month.toString().padStart(2, '0')}`,
      actual: h.totalSales,
      type: 'Historical'
    })) || [];

    const predictionData = insights?.salesTrends?.predictions?.map((p, index) => ({
      month: `Forecast ${index + 1}`,
      predicted: p.predictedSales,
      confidence: p.confidence * 100,
      type: 'Predicted'
    })) || [];

    return (
      <div>
        <div className="card">
          <h3>📈 Sales Forecasting</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={[...salesData, ...predictionData]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#2ecc71" strokeWidth={2} name="Historical Sales" />
              <Line type="monotone" dataKey="predicted" stroke="#e74c3c" strokeWidth={2} strokeDasharray="5 5" name="Predicted Sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>🎯 Prediction Confidence</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="confidence" fill="#3498db" name="Confidence %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderInventoryInsights = () => {
    const urgentItems = insights?.inventoryDemand?.insights?.filter(i => i.recommendation === 'REORDER_URGENT') || [];
    const adequateItems = insights?.inventoryDemand?.insights?.filter(i => i.recommendation === 'STOCK_ADEQUATE') || [];

    const chartData = [
      { name: 'Urgent Reorder', value: urgentItems.length, color: '#e74c3c' },
      { name: 'Stock Adequate', value: adequateItems.length, color: '#2ecc71' }
    ];

    return (
      <div>
        <div className="card">
          <h3>📦 Inventory Demand Prediction</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 style={{ color: '#e74c3c' }}>🚨 Urgent Reorders ({urgentItems.length})</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {urgentItems.map((item, index) => (
                  <div key={index} style={{ 
                    padding: '8px', 
                    margin: '4px 0', 
                    background: '#ffeaea', 
                    borderRadius: '4px',
                    borderLeft: '3px solid #e74c3c'
                  }}>
                    <strong>{item.name}</strong>
                    <br />
                    <small>Suggested order: {item.suggestedOrderQuantity} units</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>📊 Inventory Recommendations</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Suggested Order Qty</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {insights?.inventoryDemand?.insights?.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '0.8rem',
                        backgroundColor: item.recommendation === 'REORDER_URGENT' ? '#e74c3c' : '#2ecc71'
                      }}>
                        {item.recommendation === 'REORDER_URGENT' ? '🚨 Urgent' : '✅ Adequate'}
                      </span>
                    </td>
                    <td>{item.suggestedOrderQuantity} units</td>
                    <td>
                      {item.recommendation === 'REORDER_URGENT' ? '🔴 High' : '🟢 Low'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🤖 AI Insights & Analytics</h1>
        <p>Predictive analytics and intelligent business insights</p>
      </div>

      <div className="btn-group" style={{ marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
        >
          🎯 Overview
        </button>
        <button 
          className={`btn ${activeTab === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('sales')}
        >
          📈 Sales Forecasting
        </button>
        <button 
          className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory Insights
        </button>
        <button className="btn btn-success" onClick={fetchInsights}>
          🔄 Refresh Insights
        </button>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'sales' && renderSalesForecasting()}
      {activeTab === 'inventory' && renderInventoryInsights()}
    </div>
  );
};

export default AIInsights;