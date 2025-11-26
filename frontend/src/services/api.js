// Helper function to handle network errors
const handleNetworkError = (error) => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new Error('Unable to connect to the server. Please make sure the backend is running and MongoDB is accessible.');
  }
  throw error;
};

// Generic API call function with timeout
const apiCall = async (url, options = {}) => {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      headers: {
        // Only set Content-Type for JSON requests, let browser set it for FormData
        ...(!options.body || !(options.body instanceof FormData) ? {'Content-Type': 'application/json'} : {}),
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: `Server returned ${response.status} ${response.statusText}`
      }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {};
    }
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Server might be unreachable or taking too long to respond.');
    }
    handleNetworkError(error);
  }
};

// Work Orders API
const workOrdersApi = {
  getAll: () => apiCall('http://localhost:8000/api/work-orders'),
  getByAssetId: (assetId) => apiCall(`http://localhost:8000/api/work-orders?assetId=${assetId}`),
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

// Service Requests API
const serviceRequestsApi = {
  getAll: () => apiCall('http://localhost:8000/api/service-requests'),
  getById: (id) => apiCall(`http://localhost:8000/api/service-requests/${id}`),
  create: (data) => apiCall('http://localhost:8000/api/service-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`http://localhost:8000/api/service-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`http://localhost:8000/api/service-requests/${id}`, {
    method: 'DELETE',
  }),
};

// Locations API
const locationsApi = {
  getAll: () => apiCall('http://localhost:8000/api/locations'),
  getById: (id) => apiCall(`http://localhost:8000/api/locations/${id}`),
  create: (data) => apiCall('http://localhost:8000/api/locations', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`http://localhost:8000/api/locations/${id}`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  delete: (id) => apiCall(`http://localhost:8000/api/locations/${id}`, {
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
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`http://localhost:8000/api/assets/${id}`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  delete: (id) => apiCall(`http://localhost:8000/api/assets/${id}`, {
    method: 'DELETE',
  }),
  getHistory: (id) => apiCall(`http://localhost:8000/api/assets/${id}/history`),
};

// Inventory API
const inventoryApi = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams 
        ? `http://localhost:8000/api/inventory?${queryParams}`
        : 'http://localhost:8000/api/inventory';
      return await apiCall(url);
    } catch (error) {
      console.error('Inventory API error:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      return await apiCall(`http://localhost:8000/api/inventory/${id}`);
    } catch (error) {
      console.error('Inventory API error:', error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      return await apiCall('http://localhost:8000/api/inventory', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Inventory API error:', error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await apiCall(`http://localhost:8000/api/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Inventory API error:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await apiCall(`http://localhost:8000/api/inventory/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Inventory API error:', error);
      throw error;
    }
  },
};

// Documents API
const documentsApi = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams 
        ? `http://localhost:8000/api/documents?${queryParams}`
        : 'http://localhost:8000/api/documents';
      return await apiCall(url);
    } catch (error) {
      console.error('Documents API error:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      return await apiCall(`http://localhost:8000/api/documents/${id}`);
    } catch (error) {
      console.error('Documents API error:', error);
      throw error;
    }
  },
  upload: async (formData) => {
    try {
      const response = await fetch('http://localhost:8000/api/documents', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: `Server returned ${response.status} ${response.statusText}`
        }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Documents API error:', error);
      throw error;
    }
  },
  download: async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/documents/${id}/download`);
      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.status} ${response.statusText}`);
      }
      return response;
    } catch (error) {
      console.error('Documents API error:', error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await apiCall(`http://localhost:8000/api/documents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Documents API error:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await apiCall(`http://localhost:8000/api/documents/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Documents API error:', error);
      throw error;
    }
  },
};

export { workOrdersApi, assetsApi, inventoryApi, serviceRequestsApi, locationsApi, documentsApi };