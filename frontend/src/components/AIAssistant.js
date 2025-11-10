import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AIAssistant = () => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ai-assistant/chat-history`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const messages = response.data.messages.map(msg => ({
        type: msg.type,
        message: msg.content,
        messageType: msg.messageType,
        timestamp: new Date(msg.timestamp)
      }));
      setConversation(messages);
      setHistoryLoaded(true);
    } catch (error) {
      setHistoryLoaded(true);
    }
  };

  const clearChatHistory = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ai-assistant/chat-history`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setConversation([]);
    } catch (error) {
      // Handle error silently
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const userMessage = { type: 'user', message: query, timestamp: new Date() };
    setConversation(prev => [...prev, userMessage]);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ai-assistant/query`,
        { query },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      const aiMessage = {
        type: 'ai',
        message: response.data.answer || response.data.message || 'No response',
        messageType: response.data.type,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'ai',
        message: error.response?.data?.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  const handleSuggestion = (suggestion) => {
    setQuery(suggestion);
  };

  React.useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadChatHistory();
    }
  }, [isOpen, historyLoaded]);

  return (
    <>
      {/* AI Assistant Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '100px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 999,
          transition: 'transform 0.3s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        🤖
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '400px',
          height: '500px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>🤖 AI Assistant</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={clearChatHistory}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Clear chat"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Conversation Area */}
          <div style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {!historyLoaded && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                Loading chat history...
              </div>
            )}
            {historyLoaded && conversation.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: '#666',
                padding: '20px'
              }}>
                <p>👋 Hi! I'm your AI assistant.</p>
                <p>Ask me about employees, inventory, customers, projects, and more!</p>
                <div style={{ marginTop: '15px' }}>
                  <small style={{ color: '#999' }}>Try asking:</small>
                  <div style={{ marginTop: '5px' }}>
                    {['How many employees do we have?', 'Show me products with low stock', 'What projects are overdue?', 'How many pending leave requests?'].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestion(suggestion)}
                        style={{
                          display: 'block',
                          width: '100%',
                          margin: '3px 0',
                          padding: '8px',
                          background: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {conversation.map((msg, index) => (
              <div key={index} style={{
                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}>
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: msg.type === 'user' ? '#007bff' : '#f8f9fa',
                  color: msg.type === 'user' ? 'white' : '#333',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    {msg.type === 'ai' && msg.messageType && (
                      <span>{msg.messageType === 'data' ? '📊' : msg.messageType === 'alert' ? '⚠️' : msg.messageType === 'help' ? '💡' : '🤖'}</span>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                  </div>
                  {msg.data && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: msg.type === 'user' ? 'rgba(255,255,255,0.2)' : '#e9ecef',
                      borderRadius: '6px',
                      fontSize: '12px',
                      maxHeight: '100px',
                      overflowY: 'auto'
                    }}>
                      {Array.isArray(msg.data) ? (
                        msg.data.map((item, i) => (
                          <div key={i} style={{ marginBottom: '3px' }}>
                            {typeof item === 'object' ? JSON.stringify(item) : item}
                          </div>
                        ))
                      ) : (
                        <pre style={{ margin: 0, fontSize: '11px' }}>{JSON.stringify(msg.data, null, 2)}</pre>
                      )}
                    </div>
                  )}
                </div>
                
                <div style={{
                  fontSize: '10px',
                  color: '#999',
                  marginTop: '4px',
                  textAlign: msg.type === 'user' ? 'right' : 'left'
                }}>
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                padding: '10px 12px',
                background: '#f8f9fa',
                borderRadius: '12px',
                fontSize: '14px'
              }}>
                🤔 Thinking...
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleQuery} style={{
            padding: '15px',
            borderTop: '1px solid #dee2e6',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none'
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              style={{
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistant;