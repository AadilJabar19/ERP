import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Helpdesk = () => {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    department: ''
  });
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (token) {
      fetchTickets();
    }
  }, [token]);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/helpdesk`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/helpdesk`, 
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfResponse.data.csrfToken
          } 
        }
      );
      
      setShowForm(false);
      fetchTickets();
      setFormData({ title: '', description: '', category: 'general', priority: 'medium', department: '' });
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const addComment = async (ticketId) => {
    if (!comment.trim()) return;
    
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/helpdesk/${ticketId}/comment`, 
        { message: comment },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfResponse.data.csrfToken
          } 
        }
      );
      
      setComment('');
      fetchTickets();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const updateStatus = async (ticketId, status, resolution = '') => {
    try {
      const csrfResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/csrf-token`);
      
      await axios.patch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/helpdesk/${ticketId}/status`, 
        { status, resolution },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfResponse.data.csrfToken
          } 
        }
      );
      
      fetchTickets();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#2ecc71',
      medium: '#f39c12',
      high: '#e67e22',
      critical: '#e74c3c'
    };
    return colors[priority] || '#95a5a6';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#3498db',
      'in-progress': '#f39c12',
      resolved: '#2ecc71',
      closed: '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎫 Helpdesk & Support</h1>
        <p>Manage support tickets and issues</p>
      </div>

      <div className="btn-group" style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Create Ticket
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Create Support Ticket</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Title:</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Category:</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="general">General</option>
                  <option value="hr">HR</option>
                  <option value="it">IT</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority:</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department:</label>
                <input 
                  type="text" 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                required
              />
            </div>

            <div className="btn-group">
              <button type="submit" className="btn btn-success">🎫 Create Ticket</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>❌ Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Support Tickets</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket._id}>
                  <td>{ticket.ticketNumber}</td>
                  <td>{ticket.title}</td>
                  <td>{ticket.category}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '0.8rem',
                      backgroundColor: getPriorityColor(ticket.priority)
                    }}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '0.8rem',
                      backgroundColor: getStatusColor(ticket.status)
                    }}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>{ticket.createdBy?.name}</td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicket && (
        <div className="card">
          <h3>Ticket Details - {selectedTicket.ticketNumber}</h3>
          <div style={{ marginBottom: '20px' }}>
            <h4>{selectedTicket.title}</h4>
            <p>{selectedTicket.description}</p>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div>
                <strong>Status:</strong>
                <select 
                  value={selectedTicket.status} 
                  onChange={(e) => updateStatus(selectedTicket._id, e.target.value)}
                  style={{ marginLeft: '10px' }}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <h4>Comments</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '10px' }}>
              {selectedTicket.comments?.map((comment, index) => (
                <div key={index} style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  marginBottom: '5px' 
                }}>
                  <strong>{comment.user?.name}</strong> - {new Date(comment.timestamp).toLocaleString()}
                  <p>{comment.message}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                style={{ flex: 1 }}
              />
              <button 
                className="btn btn-primary"
                onClick={() => addComment(selectedTicket._id)}
              >
                💬 Add Comment
              </button>
            </div>
          </div>
          
          <button 
            className="btn btn-secondary"
            onClick={() => setSelectedTicket(null)}
          >
            ❌ Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Helpdesk;