import { useNotifications } from '../contexts/NotificationContext';

export const useNotification = () => {
  const { addNotification } = useNotifications();

  const showNotification = (title, message, priority = 'medium', path = null) => {
    addNotification({
      title,
      message,
      priority,
      path
    });
  };

  const showSuccess = (title, message, path = null) => {
    showNotification(title, message, 'low', path);
  };

  const showWarning = (title, message, path = null) => {
    showNotification(title, message, 'medium', path);
  };

  const showError = (title, message, path = null) => {
    showNotification(title, message, 'high', path);
  };

  const showWorkOrderNotification = (title, message, woId) => {
    showNotification(title, message, 'medium', `/work-orders`);
  };

  const showAssetNotification = (title, message, assetId) => {
    showNotification(title, message, 'medium', `/assets`);
  };

  const showPMNotification = (title, message, pmId) => {
    showNotification(title, message, 'medium', `/preventive-maintenance`);
  };

  const showInventoryNotification = (title, message, itemId) => {
    showNotification(title, message, 'medium', `/inventory`);
  };

  return {
    showNotification,
    showSuccess,
    showWarning,
    showError,
    showWorkOrderNotification,
    showAssetNotification,
    showPMNotification,
    showInventoryNotification
  };
};