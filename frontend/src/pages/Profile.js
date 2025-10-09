import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChangePassword from '../components/ChangePassword';

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [avatar, setAvatar] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name, email: user.email });
      setAvatar(user.avatar || null);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetchActivities();
    }
  }, [token]);

  const fetchActivities = async () => {
    if (!token) return;
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/activities`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActivities(response.data || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setActivities([]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/profile`,
        { ...profileData, avatar },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser(response.data.user);
      setIsEditing(false);
      fetchActivities(); // Refresh activities after profile update
    } catch (error) {
      console.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const saveAvatar = async () => {
    if (!avatar) return;
    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/profile`,
        { ...profileData, avatar },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser(response.data.user);
      fetchActivities(); // Refresh activities after avatar update
    } catch (error) {
      console.error('Failed to save avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👤 Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div className="profile-grid">
        <div className="card profile-main">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {avatar ? (
                <img src={avatar} alt="Avatar" />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <input type="file" id="avatar" accept="image/*" onChange={handleAvatarChange} hidden />
            <label htmlFor="avatar" className="btn btn-sm">📷 Change Photo</label>
            {avatar && avatar !== user?.avatar && (
              <button className="btn btn-success btn-sm" onClick={saveAvatar} disabled={loading}>
                {loading ? '💾 Saving...' : '💾 Save Photo'}
              </button>
            )}
          </div>

          <div className="profile-info">
            {isEditing ? (
              <>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>
                <div className="btn-group">
                  <button className="btn btn-success" onClick={handleSave} disabled={loading}>
                    {loading ? '💾 Saving...' : '💾 Save'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>❌ Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="info-item">
                  <label>Name:</label>
                  <span>{profileData.name}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{profileData.email}</span>
                </div>
                <div className="info-item">
                  <label>Role:</label>
                  <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
                </div>
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
              </>
            )}
          </div>
        </div>

        <div className="profile-sidebar">
          <div className="card">
            <h3>🔒 Security</h3>
            <button className="btn btn-primary" onClick={() => setShowChangePassword(true)}>
              Change Password
            </button>
          </div>

          <div className="card">
            <h3>📊 Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{new Date(user?.lastLogin).toLocaleDateString()}</span>
                <span className="stat-label">Last Login</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{activities.length}</span>
                <span className="stat-label">Recent Activities</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>🕒 Recent Activity</h3>
            <div className="activity-list">
              {activities.length > 0 ? activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-icon">📝</span>
                  <div>
                    <div className="activity-text">{activity.action}</div>
                    <div className="activity-time">{new Date(activity.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              )) : (
                <p className="no-activity">No recent activities</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};

export default Profile;