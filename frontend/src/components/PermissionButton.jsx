import React from 'react';
import { Button } from './ui/button';

const PermissionButton = ({ 
  children, 
  page, 
  requiredPermission = 'any', 
  variant = 'default', 
  size = 'default', 
  className = '', 
  ...props 
}) => {
  // With authentication removed, all users have full access to all actions
  const hasPermission = true;
  
  // Always show the button since all users have permission
  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
};

export default PermissionButton;