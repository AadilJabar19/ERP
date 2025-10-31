import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ActionDropdown from '../components/ActionDropdown';
import useBulkActions from '../hooks/useBulkActions';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Calendar = () => {
  const { hasRole } = useAuth();
  const { success, error, showConfirm } = useToast();
  const { selectedItems, selectAll, handleSelectAll, handleSelectItem, clearSelection } = useBulkActions();
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'meeting',
    allDay: false
  });

  useEffect(() => {
    if (activeTab === 'calendar') {
      fetchEvents();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, currentDate]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await axios.get(`http://localhost:5000/api/events?start=${start.toISOString()}&end=${end.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/events/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/events', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        type: 'meeting',
        allDay: false
      });
      setShowForm(false);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === dayDate.toDateString();
    });
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const renderCalendar = () => (
    <div>
      {hasRole(['admin', 'manager']) && (
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
          style={{ marginBottom: '20px' }}
        >
          {showForm ? 'Cancel' : 'Add Event'}
        </button>
      )}

      {showForm && (
        <div className="card">
          <h3>Add New Event</h3>
          <form onSubmit={handleSubmit}>
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
              <label>Description:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date:</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="meeting">Meeting</option>
                <option value="holiday">Holiday</option>
                <option value="deadline">Deadline</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success">Add Event</button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          >
            ← Previous
          </button>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            📅 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button 
            className="btn btn-secondary"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          >
            Next →
          </button>
        </div>

        <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#ddd' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ padding: '10px', backgroundColor: '#f8f9fa', fontWeight: 'bold', textAlign: 'center' }}>
              {day}
            </div>
          ))}
          
          {getDaysInMonth().map((day, index) => (
            <div 
              key={index} 
              style={{ 
                minHeight: '100px', 
                padding: '5px', 
                backgroundColor: 'white',
                border: day ? '1px solid #eee' : 'none'
              }}
            >
              {day && (
                <>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{day}</div>
                  {getEventsForDay(day).map(event => {
                    const eventColors = {
                      meeting: '#3498db',
                      holiday: '#e74c3c',
                      deadline: '#f39c12',
                      training: '#2ecc71',
                      other: '#9b59b6'
                    };
                    return (
                      <div 
                        key={event._id} 
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '2px 4px', 
                          margin: '1px 0',
                          backgroundColor: eventColors[event.type] || '#3498db', 
                          color: 'white', 
                          borderRadius: '3px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={`${event.title} (${event.type})`}
                      >
                        {event.type === 'meeting' ? '💼' : 
                         event.type === 'holiday' ? '🎉' :
                         event.type === 'deadline' ? '⏰' :
                         event.type === 'training' ? '🎓' : '📅'} {event.title}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Event List</h3>
          {selectedItems.length > 0 && (
            <ActionDropdown
              actions={[
                {
                  label: `Edit (${selectedItems.length})`,
                  icon: '✏️',
                  onClick: () => {
                    if (selectedItems.length === 1) {
                      success('Edit event functionality');
                    } else {
                      error('Please select only one event to edit');
                    }
                  },
                  className: 'primary',
                  disabled: selectedItems.length !== 1
                },
                {
                  label: `Delete (${selectedItems.length})`,
                  icon: '🗑️',
                  onClick: () => {
                    showConfirm(
                      'Delete Events',
                      `Delete ${selectedItems.length} event(s)?`,
                      async () => {
                        const token = localStorage.getItem('token');
                        await Promise.all(selectedItems.map(id => 
                          axios.delete(`http://localhost:5000/api/events/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                          })
                        ));
                        success(`Deleted ${selectedItems.length} event(s)`);
                        clearSelection();
                        fetchEvents();
                      }
                    );
                  },
                  className: 'danger'
                },
                {
                  label: 'Clear Selection',
                  icon: '✖️',
                  onClick: clearSelection
                }
              ]}
            />
          )}
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e, events)}
                  />
                </th>
                <th>Title</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>All Day</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(event._id)}
                      onChange={(e) => handleSelectItem(e, event._id)}
                    />
                  </td>
                  <td>{event.title}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      backgroundColor: event.type === 'meeting' ? '#3498db' : 
                                     event.type === 'holiday' ? '#e74c3c' :
                                     event.type === 'deadline' ? '#f39c12' :
                                     event.type === 'training' ? '#2ecc71' : '#9b59b6',
                      color: 'white'
                    }}>
                      {event.type}
                    </span>
                  </td>
                  <td>{new Date(event.startDate).toLocaleDateString()}</td>
                  <td>{new Date(event.endDate).toLocaleDateString()}</td>
                  <td>{event.allDay ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  const renderAnalytics = () => {
    const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];
    
    const eventTypeData = analytics.eventTypeStats?.map(type => ({
      name: type._id,
      count: type.count
    })) || [];
    
    const monthlyData = analytics.monthlyStats?.map(month => ({
      month: month._id,
      events: month.count
    })) || [];
    
    return (
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          📊 Calendar Analytics Dashboard
        </h3>
        
        <div className="grid-stats" style={{ marginBottom: '30px' }}>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📅</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Events</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>{analytics.totalEvents || 0}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>💼</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Meetings</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.eventTypeStats?.find(s => s._id === 'meeting')?.count || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>⏰</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Deadlines</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.eventTypeStats?.find(s => s._id === 'deadline')?.count || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>🎓</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Training Sessions</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.eventTypeStats?.find(s => s._id === 'training')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              🥧 Event Type Distribution
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📈 Monthly Event Trends
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="events" fill="#3498db" name="Events" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Calendar & Events</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('calendar')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          📅 Calendar
        </button>
        {hasRole(['admin', 'manager']) && (
          <button 
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('analytics')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            📊 Analytics
          </button>
        )}
      </div>

      {activeTab === 'calendar' && renderCalendar()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
};

export default Calendar;