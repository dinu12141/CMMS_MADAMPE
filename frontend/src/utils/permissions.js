// Define role groups
export const ROLE_GROUPS = {
  FULL_ACCESS: ['Administrator', 'Engineering Manager'],
  READ_ONLY: ['CEO', 'DGM'],
  FIELD_WORKERS: ['Electrician', 'Technician', 'Supervisor']
};

// Check if user has full access
export const hasFullAccess = (userRole) => {
  return ROLE_GROUPS.FULL_ACCESS.includes(userRole);
};

// Check if user has read-only access
export const isReadOnly = (userRole) => {
  return ROLE_GROUPS.READ_ONLY.includes(userRole);
};

// Check if user is a field worker
export const isFieldWorker = (userRole) => {
  return ROLE_GROUPS.FIELD_WORKERS.includes(userRole);
};

// Check if field worker has access to service requests
export const canAccessServiceRequests = (userRole) => {
  return isFieldWorker(userRole) || hasFullAccess(userRole);
};

// Check if user can perform actions (add/edit/delete)
export const canPerformActions = (userRole, page = null) => {
  // Full access users can perform actions everywhere
  if (hasFullAccess(userRole)) {
    return true;
  }
  
  // Field workers can only perform actions on service requests
  if (isFieldWorker(userRole)) {
    return page === 'service-requests';
  }
  
  // Read-only users cannot perform any actions
  return false;
};