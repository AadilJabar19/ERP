import React from 'react';
import { useSocket } from '../context/SocketContext';

const NotificationPanel = () => {
  const { notifications, removeNotification } = useSocket();

  const getNotificationColor = (type) => {
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    return colors[type] || '#6c757d';
  };

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      right: '20px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            backgroundColor: 'white',
            border: `2px solid ${getNotificationColor(notification.type)}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ 
                margin: '0 0 5px 0', 
                color: getNotificationColor(notification.type),
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {notification.title}
              </h4>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                {notification.message}
              </p>
              <small style={{ color: '#999', fontSize: '10px' }}>
                {notification.timestamp.toLocaleTimeString()}
              </small>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                color: '#999'
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;