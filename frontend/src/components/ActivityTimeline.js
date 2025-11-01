import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/components/ActivityTimeline.scss';

const ActivityTimeline = ({ userId, limit = 10 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = userId 
        ? `http://localhost:5000/api/activities/user/${userId}`
        : 'http://localhost:5000/api/activities';
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit }
      });
      
      setActivities(response.data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      login: '🔐',
      logout: '🚪',
      upload: '📤',
      download: '📥',
      approve: '✅',
      reject: '❌',
      comment: '💬',
      assign: '👤',
      complete: '✔️',
      default: '📝'
    };
    return icons[type] || icons.default;
  };

  const getActivityColor = (type) => {
    const colors = {
      create: '#10b981',
      update: '#3b82f6',
      delete: '#ef4444',
      login: '#8b5cf6',
      logout: '#6b7280',
      upload: '#f59e0b',
      download: '#06b6d4',
      approve: '#22c55e',
      reject: '#dc2626',
      comment: '#ec4899',
      assign: '#14b8a6',
      complete: '#84cc16',
      default: '#6b7280'
    };
    return colors[type] || colors.default;
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityTime.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="activity-timeline">
        <div className="timeline-loading">Loading activities...</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="activity-timeline">
        <div className="timeline-empty">
          <span className="empty-icon">📭</span>
          <p>No recent activities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-timeline">
      {activities.map((activity, index) => (
        <div key={activity._id || index} className="timeline-item">
          <div 
            className="timeline-icon"
            style={{ backgroundColor: getActivityColor(activity.type) }}
          >
            {getActivityIcon(activity.type)}
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="timeline-user">{activity.userName || 'System'}</span>
              <span className="timeline-time">{formatTime(activity.timestamp || activity.createdAt)}</span>
            </div>
            <div className="timeline-action">{activity.action || activity.description}</div>
            {activity.details && (
              <div className="timeline-details">{activity.details}</div>
            )}
            {activity.module && (
              <span className="timeline-badge">{activity.module}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
