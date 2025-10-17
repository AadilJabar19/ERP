import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadChatHistory();
      fetchRecommendations();
      fetchInsights();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/ai-assistant/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      // Handle error silently
    }
  };

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/ai-assistant/insights', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInsights(response.data);
    } catch (error) {
      // Handle error silently
    }
  };

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/ai-assistant/chat-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const messages = response.data.messages.map((msg, index) => ({
        id: index + 1,
        type: msg.type,
        content: msg.content,
        messageType: msg.messageType,
        timestamp: new Date(msg.timestamp)
      }));
      
      if (messages.length === 0) {
        setMessages([{
          id: 1,
          type: 'ai',
          content: `Hello ${user?.name}! I'm your AI assistant. I can help you with information about employees, inventory, customers, projects, and more. What would you like to know?`,
          timestamp: new Date()
        }]);
      } else {
        setMessages(messages);
      }
      setHistoryLoaded(true);
    } catch (error) {
      setMessages([{
        id: 1,
        type: 'ai',
        content: `Hello ${user?.name}! I'm your AI assistant. I can help you with information about employees, inventory, customers, projects, and more. What would you like to know?`,
        timestamp: new Date()
      }]);
      setHistoryLoaded(true);
    }
  };

  const clearChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/ai-assistant/chat-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([{
        id: 1,
        type: 'ai',
        content: `Hello ${user?.name}! I'm your AI assistant. I can help you with information about employees, inventory, customers, projects, and more. What would you like to know?`,
        timestamp: new Date()
      }]);
    } catch (error) {
      // Handle error silently
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/ai-assistant/query', {
        query: inputMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.answer,
        data: response.data.data,
        messageType: response.data.type,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        messageType: 'error',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuery = (query) => {
    setInputMessage(query);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'data': return '📊';
      case 'alert': return '⚠️';
      case 'help': return '💡';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '🤖';
    }
  };

  const renderMessageData = (data, type) => {
    if (!data) return null;

    if (Array.isArray(data)) {
      return (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          {data.map((item, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {typeof item === 'object' ? JSON.stringify(item, null, 2) : item}
            </div>
          ))}
        </div>
      );
    }

    if (typeof data === 'object') {
      return (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <pre style={{ margin: 0, fontSize: '0.9rem' }}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="page-container">
      <h1 className="page-title">🤖 AI Assistant</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', height: 'calc(100vh - 200px)' }}>
        {/* Chat Interface */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            margin: '0 0 20px 0', 
            padding: '0 0 10px 0', 
            borderBottom: '1px solid #eee' 
          }}>
            <h3 style={{ margin: 0 }}>Chat with AI Assistant</h3>
            <button
              onClick={clearChatHistory}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title="Clear chat"
            >
              🗑️ Clear
            </button>
          </div>
          
          {/* Messages */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {messages.map(message => (
              <div key={message.id} style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '10px 15px',
                  borderRadius: '18px',
                  backgroundColor: message.type === 'user' ? '#007bff' : '#ffffff',
                  color: message.type === 'user' ? 'white' : 'black',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    {message.type === 'ai' && (
                      <span>{getMessageTypeIcon(message.messageType)}</span>
                    )}
                    <strong>{message.type === 'user' ? 'You' : 'AI Assistant'}</strong>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                  {message.data && renderMessageData(message.data, message.messageType)}
                  <div style={{ 
                    fontSize: '0.8rem', 
                    opacity: 0.7, 
                    marginTop: '5px',
                    textAlign: 'right'
                  }}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
                <div style={{
                  padding: '10px 15px',
                  borderRadius: '18px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <LoadingSpinner />
                  <span style={{ marginLeft: '10px' }}>AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your ERP data..."
              style={{ 
                flex: 1, 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '20px',
                outline: 'none'
              }}
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !inputMessage.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Send
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Queries */}
          <div className="card">
            <h4>💡 Quick Queries</h4>
            {insights?.examples?.map((example, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuery(example)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  margin: '5px 0',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem'
                }}
              >
                {example}
              </button>
            ))}
          </div>

          {/* Recommendations */}
          <div className="card">
            <h4>🎯 Smart Recommendations</h4>
            {recommendations.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No recommendations at the moment</p>
            ) : (
              recommendations.map((rec, index) => (
                <div key={index} style={{
                  padding: '10px',
                  margin: '10px 0',
                  backgroundColor: '#f8f9fa',
                  borderLeft: `4px solid ${getPriorityColor(rec.priority)}`,
                  borderRadius: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{rec.title}</strong>
                    <span style={{
                      fontSize: '0.8rem',
                      padding: '2px 6px',
                      backgroundColor: getPriorityColor(rec.priority),
                      color: 'white',
                      borderRadius: '10px'
                    }}>
                      {rec.priority}
                    </span>
                  </div>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                    {rec.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Capabilities */}
          <div className="card">
            <h4>🔧 Capabilities</h4>
            {insights?.capabilities?.map((capability, index) => (
              <div key={index} style={{
                padding: '5px 0',
                fontSize: '0.9rem',
                borderBottom: index < insights.capabilities.length - 1 ? '1px solid #eee' : 'none'
              }}>
                • {capability}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;