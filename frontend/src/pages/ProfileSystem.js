import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ChangePassword from '../components/ChangePassword';

const ProfileSystem = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({});
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', 
    dateOfBirth: '', emergencyContact: { name: '', phone: '', relationship: '' },
    bio: '', skills: [], interests: [], avatar: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      switch (activeTab) {
        case 'profile':
          const profileRes = await axios.get('http://localhost:5000/api/auth/profile', { headers, withCredentials: true });
          setProfile(profileRes.data);
          setFormData({
            name: profileRes.data.name || '',
            email: profileRes.data.email || '',
            phone: profileRes.data.phone || '',
            address: profileRes.data.address || '',
            dateOfBirth: profileRes.data.dateOfBirth ? profileRes.data.dateOfBirth.split('T')[0] : '',
            emergencyContact: profileRes.data.emergencyContact || { name: '', phone: '', relationship: '' },
            bio: profileRes.data.bio || '',
            skills: profileRes.data.skills || [],
            interests: profileRes.data.interests || [],
            avatar: profileRes.data.avatar || ''
          });
          break;
        case 'activity':
          const activityRes = await axios.get('http://localhost:5000/api/auth/activities', { headers, withCredentials: true });
          setActivities(activityRes.data || []);
          break;
        case 'notifications':
          // Mock notifications for now
          setNotifications([
            { _id: '1', title: 'Welcome!', message: 'Welcome to the ERP system', type: 'info', read: false, createdAt: new Date() },
            { _id: '2', title: 'Profile Updated', message: 'Your profile was successfully updated', type: 'success', read: true, createdAt: new Date(Date.now() - 86400000) }
          ]);
          break;
        case 'preferences':
          const prefRes = await axios.get('http://localhost:5000/api/auth/preferences', { headers, withCredentials: true });
          setPreferences(prefRes.data || {});
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({...formData, avatar: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      
      setProfile(response.data);
      setFormData({...formData, avatar: response.data.avatar});
      updateUser(response.data);
      setEditing(false);
      success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      error('Error: ' + (err.response?.data?.message || 'Failed to update profile'));
    }
  };

  const handlePreferencesUpdate = async (newPreferences) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/preferences', newPreferences, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      
      setPreferences(newPreferences);
      setShowPreferencesModal(false);
      success('Preferences updated successfully!');
    } catch (err) {
      console.error('Error updating preferences:', err);
      error('Error updating preferences');
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      // Mock notification read functionality
      setNotifications(prev => prev.map(n => n._id === notificationId ? {...n, read: true} : n));
      fetchData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const renderProfile = () => (
    <div className="profile-grid">
      <div className="profile-main">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {formData.avatar || profile.avatar ? (
              <img src={formData.avatar || profile.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              getInitials(profile.name)
            )}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
            id="avatar-upload"
          />
          <label htmlFor="avatar-upload" className="btn btn-sm btn-secondary" style={{ cursor: 'pointer' }}>
            Change Photo
          </label>
        </div>
        
        <div className="profile-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>{profile.name}</h2>
            <div>
              <span className={`role-badge role-${profile.role}`}>
                {profile.role}
              </span>
              <button 
                className="btn btn-primary" 
                style={{ marginLeft: '10px' }}
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
          
          {editing ? (
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Full Name:</label>
                <input type="text" value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input type="tel" value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Date of Birth:</label>
                <input type="date" value={formData.dateOfBirth} 
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Bio:</label>
                <textarea value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                  placeholder="Tell us about yourself..." />
              </div>
              
              <h4>Emergency Contact</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Name:</label>
                  <input type="text" value={formData.emergencyContact.name} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      emergencyContact: {...formData.emergencyContact, name: e.target.value}
                    })} />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input type="tel" value={formData.emergencyContact.phone} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      emergencyContact: {...formData.emergencyContact, phone: e.target.value}
                    })} />
                </div>
              </div>
              <div className="form-group">
                <label>Relationship:</label>
                <input type="text" value={formData.emergencyContact.relationship} 
                  onChange={(e) => setFormData({
                    ...formData, 
                    emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
                  })} />
              </div>
              
              <button type="submit" className="btn btn-success">Update Profile</button>
            </form>
          ) : (
            <div>
              <div className="info-item">
                <label>Email:</label>
                <span>{profile.email}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{profile.phone || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Address:</label>
                <span>{profile.address || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Date of Birth:</label>
                <span>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Member Since:</label>
                <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Last Login:</label>
                <span>{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}</span>
              </div>
              
              {profile.bio && (
                <div style={{ marginTop: '20px' }}>
                  <h4>About Me</h4>
                  <p style={{ color: '#666', lineHeight: '1.6' }}>{profile.bio}</p>
                </div>
              )}
              
              {profile.emergencyContact?.name && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Emergency Contact</h4>
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{profile.emergencyContact.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{profile.emergencyContact.phone}</span>
                  </div>
                  <div className="info-item">
                    <label>Relationship:</label>
                    <span>{profile.emergencyContact.relationship}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="profile-sidebar">
        <div className="card">
          <h4>Quick Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
              🔒 Change Password
            </button>
            <button className="btn btn-secondary" onClick={() => setShowPreferencesModal(true)}>
              ⚙️ Preferences
            </button>
            <button className="btn btn-secondary">
              📄 Download Data
            </button>
          </div>
        </div>
        
        <div className="card">
          <h4>Account Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{profile.loginCount || 0}</span>
              <span className="stat-label">Total Logins</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profile.profileViews || 0}</span>
              <span className="stat-label">Profile Views</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Math.floor((new Date() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24)) || 0}</span>
              <span className="stat-label">Days Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profile.completionRate || 0}%</span>
              <span className="stat-label">Profile Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="card">
      <h3>📊 Recent Activity</h3>
      
      {loading ? <LoadingSpinner /> : (
        <div className="activity-list">
          {activities.length === 0 ? (
            <div className="no-activity">No recent activity found.</div>
          ) : (
            activities.map(activity => (
              <div key={activity._id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'login' ? '🔐' :
                   activity.type === 'profile_update' ? '👤' :
                   activity.type === 'password_change' ? '🔒' :
                   activity.type === 'data_export' ? '📄' : '📝'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="activity-text">{activity.description}</div>
                  <div className="activity-time">{new Date(activity.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="card">
      <h3>🔔 Notifications</h3>
      
      {loading ? <LoadingSpinner /> : (
        <div>
          {notifications.length === 0 ? (
            <p>No notifications found.</p>
          ) : (
            notifications.map(notification => (
              <div key={notification._id} style={{ 
                padding: '15px', 
                marginBottom: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: notification.read ? '#f8f9fa' : '#fff3cd',
                borderLeft: `4px solid ${notification.type === 'error' ? '#dc3545' : notification.type === 'warning' ? '#ffc107' : '#28a745'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: '0 0 5px 0' }}>{notification.title}</h5>
                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>{notification.message}</p>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!notification.read && (
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => markNotificationAsRead(notification._id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderPreferences = () => (
    <div className="card">
      <h3>⚙️ Preferences</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div>
          <h4>Notification Settings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={preferences.emailNotifications || false} 
                onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
              />
              Email Notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={preferences.pushNotifications || false} 
                onChange={(e) => setPreferences({...preferences, pushNotifications: e.target.checked})}
              />
              Push Notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={preferences.smsNotifications || false} 
                onChange={(e) => setPreferences({...preferences, smsNotifications: e.target.checked})}
              />
              SMS Notifications
            </label>
          </div>
        </div>
        
        <div>
          <h4>Display Settings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label>Theme:</label>
              <select 
                value={preferences.theme || 'light'} 
                onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label>Language:</label>
              <select 
                value={preferences.language || 'en'} 
                onChange={(e) => setPreferences({...preferences, language: e.target.value})}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div>
              <label>Timezone:</label>
              <select 
                value={preferences.timezone || 'UTC'} 
                onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <h4>Privacy Settings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={preferences.profileVisible || false} 
                onChange={(e) => setPreferences({...preferences, profileVisible: e.target.checked})}
              />
              Profile Visible to Others
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={preferences.activityVisible || false} 
                onChange={(e) => setPreferences({...preferences, activityVisible: e.target.checked})}
              />
              Activity Visible to Others
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={preferences.dataCollection || false} 
                onChange={(e) => setPreferences({...preferences, dataCollection: e.target.checked})}
              />
              Allow Data Collection
            </label>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button className="btn btn-success" onClick={() => handlePreferencesUpdate(preferences)}>
          Save Preferences
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👤 My Profile</h1>
        <p>Manage your personal information and account settings</p>
      </div>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        <button 
          className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('activity')}
        >
          📊 Activity
        </button>
        <button 
          className={`btn ${activeTab === 'notifications' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
        <button 
          className={`btn ${activeTab === 'preferences' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ Preferences
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'activity' && renderActivity()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'preferences' && renderPreferences()}
        </>
      )}
      
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <ChangePassword onSuccess={() => setShowPasswordModal(false)} />
      </Modal>
    </div>
  );
};

export default ProfileSystem;