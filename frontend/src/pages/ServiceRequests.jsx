import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Plus, 
  FileText,
  User,
  MapPin,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { serviceRequestsApi } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import ServiceRequestModal from '../components/ServiceRequestModal';
import PermissionButton from '../components/PermissionButton';

const ServiceRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceRequests, setServiceRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentRequest, setCurrentRequest] = useState(null);
  
  const { showSuccess, showError, showWarning } = useNotification();

  // Load service requests on component mount
  useEffect(() => {
    loadServiceRequests();
  }, []);

  // Apply filters when service requests or filter values change
  useEffect(() => {
    applyFilters();
  }, [serviceRequests, searchTerm, statusFilter]);

  const loadServiceRequests = async () => {
    try {
      setLoading(true);
      const data = await serviceRequestsApi.getAll();
      setServiceRequests(data);
    } catch (err) {
      console.error('Failed to load service requests', err);
      showError('Load Error', 'Failed to load service requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = serviceRequests;
    
    // Search term filter
    if (searchTerm) {
      result = result.filter(req => 
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(req => req.status === statusFilter);
    }
    
    setFilteredRequests(result);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'assigned': return 'bg-purple-100 text-purple-700';
      case 'converted': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statusCounts = {
    all: serviceRequests.length,
    open: serviceRequests.filter(r => r.status === 'open').length,
    assigned: serviceRequests.filter(r => r.status === 'assigned').length,
    converted: serviceRequests.filter(r => r.status === 'converted').length
  };

  const handleCreateRequest = () => {
    setCurrentRequest(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditRequest = (request) => {
    setCurrentRequest(request);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSaveRequest = async (requestData, selectedFile) => {
    try {
      if (modalMode === 'create') {
        // Create new service request
        const newRequest = await serviceRequestsApi.create(requestData);
        
        // If a file was selected, upload it
        if (selectedFile) {
          try {
            await serviceRequestsApi.uploadFile(newRequest.id, selectedFile);
            showSuccess('File Uploaded', 'Attachment has been uploaded successfully');
          } catch (fileError) {
            console.error('Failed to upload file', fileError);
            showError('File Upload Error', `Failed to upload file: ${fileError.message}`);
          }
        }
        
        setServiceRequests([...serviceRequests, newRequest]);
        showSuccess('Service Request Created', 'New service request has been successfully created');
      } else if (modalMode === 'edit') {
        // Update existing service request
        const updatedRequest = await serviceRequestsApi.update(currentRequest.id, requestData);
        
        // If a file was selected, upload it
        if (selectedFile) {
          try {
            await serviceRequestsApi.uploadFile(currentRequest.id, selectedFile);
            showSuccess('File Uploaded', 'Attachment has been uploaded successfully');
          } catch (fileError) {
            console.error('Failed to upload file', fileError);
            showError('File Upload Error', `Failed to upload file: ${fileError.message}`);
          }
        }
        
        setServiceRequests(serviceRequests.map(req => 
          req.id === currentRequest.id ? updatedRequest : req
        ));
        showSuccess('Service Request Updated', 'Service request has been successfully updated');
      }
      setShowModal(false);
      setCurrentRequest(null);
    } catch (err) {
      console.error('Failed to save service request', err);
      showError('Save Error', `Failed to save service request: ${err.message}`);
      return false; // Prevent modal from closing
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentRequest(null);
  };

  const handleAssignRequest = async (requestId) => {
    try {
      // In a real app, this would open a modal to select who to assign to
      // For now, we'll just assign to a default user
      const updatedRequest = await serviceRequestsApi.update(requestId, {
        status: 'assigned',
        assignedTo: 'John Smith' // This would be selected by the user in a real app
      });
      
      setServiceRequests(serviceRequests.map(req => 
        req.id === requestId ? updatedRequest : req
      ));
      
      showSuccess('Request Assigned', 'Service request has been assigned successfully');
    } catch (err) {
      console.error('Failed to assign service request', err);
      showError('Assignment Error', `Failed to assign service request: ${err.message}`);
    }
  };

  const handleConvertToWO = async (request) => {
    try {
      // In a real app, this would open a modal to create the work order
      // For now, we'll just update the status and add a mock WO number
      const woNumber = `WO-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const updatedRequest = await serviceRequestsApi.update(request.id, {
        status: 'converted',
        convertedToWO: woNumber
      });
      
      setServiceRequests(serviceRequests.map(req => 
        req.id === request.id ? updatedRequest : req
      ));
      
      showSuccess('Request Converted', `Service request has been converted to Work Order ${woNumber}`);
    } catch (err) {
      console.error('Failed to convert service request', err);
      showError('Conversion Error', `Failed to convert service request: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto animate-spin" />
          <p className="mt-2 text-slate-500">Loading service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Service Requests" 
        subtitle="Manage incoming service and maintenance requests"
      />
      
      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
          </div>
          <PermissionButton 
            page="service-requests"
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handleCreateRequest}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </PermissionButton>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'open', 'assigned', 'converted'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
              <Badge variant="secondary" className="ml-2">
                {statusCounts[status]}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-mono text-sm font-medium text-slate-600">{request.requestNumber}</span>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge variant="outline">
                        {request.category}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{request.title}</h3>
                    <p className="text-slate-600 mb-4">{request.description}</p>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Requested By</p>
                          <p className="text-sm font-medium text-slate-900">{request.requestedBy}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Location</p>
                          <p className="text-sm font-medium text-slate-900">{request.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Created</p>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(request.createdDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Department</p>
                          <p className="text-sm font-medium text-slate-900">{request.department}</p>
                        </div>
                      </div>
                    </div>

                    {request.assignedTo && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <CheckCircle className="inline w-4 h-4 mr-1" />
                          Assigned to: <span className="font-medium">{request.assignedTo}</span>
                        </p>
                      </div>
                    )}

                    {request.convertedToWO && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-900">
                          <CheckCircle className="inline w-4 h-4 mr-1" />
                          Converted to Work Order: <span className="font-medium">{request.convertedToWO}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {request.status === 'open' && (
                      <>
                        <PermissionButton page="service-requests" variant="outline" size="sm" onClick={() => handleAssignRequest(request.id)}>Assign</PermissionButton>
                        <PermissionButton page="service-requests" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleConvertToWO(request)}>Convert to WO</PermissionButton>
                      </>
                    )}
                    {request.status === 'assigned' && (
                      <>
                        <PermissionButton page="service-requests" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleConvertToWO(request)}>Convert to WO</PermissionButton>
                        <PermissionButton page="service-requests" variant="outline" size="sm">
                          <XCircle className="w-4 h-4 mr-1" />
                          Close
                        </PermissionButton>
                      </>
                    )}
                    {request.status === 'converted' && (
                      <PermissionButton page="service-requests" variant="outline" size="sm">View Work Order</PermissionButton>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No service requests found matching your criteria.</p>
          </div>
        )}
      </div>
      
      <ServiceRequestModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSaveRequest}
        serviceRequest={currentRequest}
        mode={modalMode}
      />
    </div>
  );
};

export default ServiceRequests;