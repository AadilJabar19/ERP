import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import Modal from '../components/Modal';
import BulkActions from '../components/BulkActions';
import CSVUpload from '../components/CSVUpload';
import { Button } from '../components/ui';
import useBulkActions from '../hooks/useBulkActions';
import '../styles/pages/CalendarSystem.scss';

const CalendarSystem = () => {
  const { hasRole, user } = useAuth();
  const [events, setEvents] = useState([]);
  
  // Bulk actions hook
  const eventsBulk = useBulkActions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month');
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', startDate: '', endDate: '', 
    startTime: '', endTime: '', type: 'meeting', priority: 'medium',
    attendees: [], location: '', reminder: 15, recurring: false
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        }
      });
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const eventData = {
        ...formData,
        startDate: `${formData.startDate}T${formData.startTime}`,
        endDate: `${formData.endDate}T${formData.endTime}`,
        createdBy: user._id
      };

      if (editingEvent) {
        await axios.put(`http://localhost:5000/api/events/${editingEvent._id}`, eventData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/events', eventData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to save event'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', startDate: '', endDate: '', 
      startTime: '', endTime: '', type: 'meeting', priority: 'medium',
      attendees: [], location: '', reminder: 15, recurring: false
    });
  };

  const handleCSVUpload = async (csvData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/events/bulk', {
        events: csvData
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert(`Successfully imported ${csvData.length} events`);
      setShowCSVModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error importing events:', error);
      alert('Error importing events: ' + (error.response?.data?.message || 'Failed to import'));
    }
  };

  const getCSVTemplate = () => {
    return [{
      title: 'Team Meeting',
      description: 'Weekly team sync meeting',
      startDate: '2024-01-15',
      endDate: '2024-01-15',
      startTime: '09:00',
      endTime: '10:00',
      type: 'meeting',
      priority: 'medium',
      location: 'Conference Room A'
    }];
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#ddd' }}>
        {weekDays.map(day => (
          <div key={day} style={{ padding: '10px', backgroundColor: '#f8f9fa', fontWeight: 'bold', textAlign: 'center' }}>
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dayEvents = day ? getEventsForDate(day) : [];
          const isToday = day && day.toDateString() === new Date().toDateString();
          const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString();

          return (
            <div
              key={index}
              style={{
                minHeight: '100px',
                padding: '5px',
                backgroundColor: day ? (isSelected ? '#e3f2fd' : isToday ? '#fff3e0' : 'white') : '#f5f5f5',
                cursor: day ? 'pointer' : 'default',
                border: isToday ? '2px solid #ff9800' : '1px solid #eee'
              }}
              onClick={() => day && setSelectedDate(day)}
            >
              {day && (
                <>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {day.getDate()}
                  </div>
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event._id}
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 4px',
                        marginBottom: '2px',
                        borderRadius: '3px',
                        backgroundColor: 
                          event.type === 'meeting' ? '#2196f3' :
                          event.type === 'deadline' ? '#f44336' :
                          event.type === 'holiday' ? '#4caf50' : '#ff9800',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEvent(event);
                        setFormData({
                          title: event.title,
                          description: event.description,
                          startDate: event.startDate.split('T')[0],
                          endDate: event.endDate.split('T')[0],
                          startTime: event.startDate.split('T')[1]?.substring(0, 5) || '',
                          endTime: event.endDate.split('T')[1]?.substring(0, 5) || '',
                          type: event.type,
                          priority: event.priority,
                          location: event.location || '',
                          reminder: event.reminder || 15
                        });
                        setShowModal(true);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: '0.6rem', color: '#666' }}>
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title">📅 Calendar System</h1>
        <Button variant="primary" icon="➕" onClick={() => {
          setEditingEvent(null);
          resetForm();
          if (selectedDate) {
            setFormData(prev => ({
              ...prev,
              startDate: selectedDate.toISOString().split('T')[0],
              endDate: selectedDate.toISOString().split('T')[0]
            }));
          }
          setShowModal(true);
        }}>
          Add Event
        </Button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Button variant="secondary" onClick={() => navigateMonth(-1)}>
              ← Previous
            </Button>
            <h2 style={{ margin: 0 }}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="secondary" onClick={() => navigateMonth(1)}>
              Next →
            </Button>
          </div>
          <Button variant="info" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>

        {loading ? <LoadingSpinner /> : renderCalendar()}
      </div>

      {selectedDate && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Events for {selectedDate.toLocaleDateString()}</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {eventsBulk.selectedItems.length > 0 && (
                <BulkActions
                  selectedCount={eventsBulk.selectedItems.length}
                  onBulkDelete={() => eventsBulk.handleBulkDelete('events', 'http://localhost:5000/api/events', fetchEvents)}
                  onClearSelection={eventsBulk.clearSelection}
                />
              )}
              <Button variant="info" icon="📤" onClick={() => setShowCSVModal(true)}>
                Import CSV
              </Button>
            </div>
          </div>
          {getEventsForDate(selectedDate).length === 0 ? (
            <p>No events scheduled for this date.</p>
          ) : (
            <div>
              {getEventsForDate(selectedDate).map(event => (
                <div key={event._id} style={{ 
                  padding: '10px', 
                  marginBottom: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '10px', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={eventsBulk.selectedItems.includes(event._id)}
                        onChange={(e) => eventsBulk.handleSelectItem(e, event._id)}
                        style={{ marginTop: '2px' }}
                      />
                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>{event.title}</h4>
                        <p style={{ margin: '0 0 5px 0', color: '#666' }}>{event.description}</p>
                        <div style={{ fontSize: '0.9rem', color: '#888' }}>
                          <span>🕒 {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(event.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {event.location && <span> | 📍 {event.location}</span>}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      backgroundColor: 
                        event.type === 'meeting' ? '#2196f3' :
                        event.type === 'deadline' ? '#f44336' :
                        event.type === 'holiday' ? '#4caf50' : '#ff9800',
                      color: 'white'
                    }}>
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingEvent ? 'Edit Event' : 'Add Event'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title:</label>
            <input type="text" value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date:</label>
              <input type="date" value={formData.startDate} 
                onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>End Date:</label>
              <input type="date" value={formData.endDate} 
                onChange={(e) => setFormData({...formData, endDate: e.target.value})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time:</label>
              <input type="time" value={formData.startTime} 
                onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
            </div>
            <div className="form-group">
              <label>End Time:</label>
              <input type="time" value={formData.endTime} 
                onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Event Type:</label>
              <select value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="holiday">Holiday</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority:</label>
              <select value={formData.priority} 
                onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Location:</label>
            <input type="text" value={formData.location} 
              onChange={(e) => setFormData({...formData, location: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-success">
            {editingEvent ? 'Update Event' : 'Create Event'}
          </button>
        </form>
      </Modal>
      
      <CSVUpload
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onUpload={handleCSVUpload}
        templateData={getCSVTemplate()}
        title="Import Events"
        description="Upload a CSV file to bulk import calendar events. Download the template to see the required format."
      />
    </div>
  );
};

export default CalendarSystem;