import React from 'react';
import { Button } from './ui/button';
import { useNotification } from '../hooks/useNotification';

const NotificationGenerator = () => {
  const {
    showNotification,
    showSuccess,
    showWarning,
    showError,
    showWorkOrderNotification,
    showAssetNotification,
    showPMNotification,
    showInventoryNotification
  } = useNotification();

  const generateSampleNotifications = () => {
    // Generate different types of notifications
    showSuccess('System Update', 'CMMS system has been successfully updated to version 2.1.0');
    
    setTimeout(() => {
      showWarning('Maintenance Due', 'HVAC Unit A1 requires maintenance within 48 hours');
    }, 1000);
    
    setTimeout(() => {
      showError('Critical Alert', 'Boiler Section pressure levels exceeded safe threshold');
    }, 2000);
    
    setTimeout(() => {
      showWorkOrderNotification('New Work Order', 'WO-2025-001 has been assigned to you', 'WO-2025-001');
    }, 3000);
    
    setTimeout(() => {
      showAssetNotification('Asset Alert', 'Centrifuge Unit VC-101 showing unusual vibration patterns', 'ASSET-001');
    }, 4000);
    
    setTimeout(() => {
      showPMNotification('PM Reminder', 'Monthly filter replacement for Air Compressor AC-2 is due tomorrow', 'PM-004');
    }, 5000);
    
    setTimeout(() => {
      showInventoryNotification('Low Stock Alert', 'Filter-24x24 inventory level is below minimum threshold', 'INV-001');
    }, 6000);
  };

  const generateCustomNotification = () => {
    showNotification(
      'Custom Notification',
      'This is a custom notification with medium priority',
      'medium'
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200">
      <h3 className="text-lg font-medium text-slate-900 mb-3">Notification Generator</h3>
      <p className="text-sm text-slate-600 mb-4">
        Click the buttons below to generate sample notifications for testing purposes.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={generateSampleNotifications} variant="outline">
          Generate Sample Notifications
        </Button>
        <Button onClick={generateCustomNotification} variant="outline">
          Generate Custom Notification
        </Button>
      </div>
    </div>
  );
};

export default NotificationGenerator;