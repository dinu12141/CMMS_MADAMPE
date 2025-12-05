import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationsApi } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage on initial load
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Fetch backend alerts periodically
  useEffect(() => {
    let isMounted = true;

    const fetchAlerts = async () => {
      try {
        const alerts = await notificationsApi.getAlerts();
        if (!isMounted || !Array.isArray(alerts)) {
          return;
        }
        setNotifications((prev) => {
          const existingAlertIds = new Set(
            prev
              .filter((notification) => notification.source === 'pm-alert' && notification.alertId)
              .map((notification) => notification.alertId)
          );

          const newAlerts = alerts
            .filter((alert) => alert && alert.id && !existingAlertIds.has(alert.id))
            .map((alert) => ({
              id: `pm-alert-${alert.id}`,
              alertId: alert.id,
              timestamp: alert.nextDue || new Date().toISOString(),
              read: false,
              title: `PM Due Soon: ${alert.name || alert.pmNumber}`,
              message: `Due in ${typeof alert.daysUntil === 'number' ? alert.daysUntil : '?'} day(s) for asset ${alert.assetId || 'N/A'}`,
              priority: alert.priority || 'medium',
              source: 'pm-alert'
            }));

          if (newAlerts.length === 0) {
            return prev;
          }

          return [...newAlerts, ...prev].slice(0, 50);
        });
      } catch (error) {
        console.error('Failed to fetch notification alerts', error);
      }
    };

    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep only last 50 notifications
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};