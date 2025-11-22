// Helper function to handle network errors
const handleNetworkError = (error) => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new Error('Unable to connect to the server. Please make sure the backend is running.');
  }
  throw error;
};

// Generic API call function
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    handleNetworkError(error);
  }
};

// Work Orders API
const workOrdersApi = {
  getAll: () => apiCall('http://localhost:8000/api/work-orders'),
  getById: (id) => apiCall(`http://localhost:8000/api/work-orders/${id}`),
  create: (data) => apiCall('http://localhost:8000/api/work-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`http://localhost:8000/api/work-orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`http://localhost:8000/api/work-orders/${id}`, {
    method: 'DELETE',
  }),
};

// Assets API
const assetsApi = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams 
      ? `http://localhost:8000/api/assets?${queryParams}`
      : 'http://localhost:8000/api/assets';
    return apiCall(url);
  },
  getById: (id) => apiCall(`http://localhost:8000/api/assets/${id}`),
  create: (data) => apiCall('http://localhost:8000/api/assets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`http://localhost:8000/api/assets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`http://localhost:8000/api/assets/${id}`, {
    method: 'DELETE',
  }),
  getHistory: (id) => apiCall(`http://localhost:8000/api/assets/${id}/history`),
};

export { workOrdersApi, assetsApi };