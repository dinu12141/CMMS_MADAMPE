import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Plus, 
  Filter,
  Wrench,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { workOrdersApi } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import ProgressUpdateModal from '../components/ProgressUpdateModal';
import WorkOrderModal from '../components/WorkOrderModal';
import WorkOrderDetailModal from '../components/WorkOrderDetailModal';
import { workOrders as mockWorkOrders } from '../mockData';

const WorkOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [workOrdersData, setWorkOrdersData] = useState([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [currentWorkOrder, setCurrentWorkOrder] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  
  const { showSuccess, showWarning, showError } = useNotification();

  // Load work orders on component mount
  useEffect(() => {
    loadWorkOrders();
  }, []);

  // Apply filters when work orders or filter values change
  useEffect(() => {
    applyFilters();
  }, [workOrdersData, searchTerm, priorityFilter, statusFilter, typeFilter]);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      const data = await workOrdersApi.getAll();
      setWorkOrdersData(data);
      setUsingMockData(false);
      
      // Show a notification when work orders are loaded
      showSuccess('Work Orders Loaded', `Successfully loaded ${data.length} work orders`);
    } catch (err) {
      console.error('Error fetching work orders from backend:', err);
      // Fallback to mock data
      setWorkOrdersData(mockWorkOrders);
      setUsingMockData(true);
      setError('Using mock data - backend unavailable');
      showError('Load Error', 'Failed to load work orders. Using mock data instead.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = workOrdersData;
    
    // Search term filter
    if (searchTerm) {
      result = result.filter(wo => 
        wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(wo => wo.priority === priorityFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(wo => wo.status === statusFilter);
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(wo => wo.type === typeFilter);
    }
    
    setFilteredWorkOrders(result);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'on-hold': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'preventive': return 'bg-green-100 text-green-700';
      case 'corrective': return 'bg-blue-100 text-blue-700';
      case 'emergency': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Priority, status, and type options
  const priorities = ['all', 'critical', 'high', 'medium', 'low'];
  const statuses = ['all', 'open', 'in-progress', 'completed', 'on-hold', 'cancelled'];
  const types = ['all', 'preventive', 'corrective', 'emergency'];

  const handleCreateWorkOrder = () => {
    setCurrentWorkOrder(null);
    setModalMode('create');
    setShowWorkOrderModal(true);
  };

  const handleViewDetails = (workOrder) => {
    setCurrentWorkOrder(workOrder);
    setModalMode('view');
    setShowWorkOrderModal(true);
  };

  const handleEditWorkOrder = (workOrder) => {
    setCurrentWorkOrder(workOrder);
    setModalMode('edit');
    setShowWorkOrderModal(true);
  };

  const handleSaveWorkOrder = async (workOrderData) => {
    try {
      if (modalMode === 'create') {
        // Create new work order
        const newWorkOrder = await workOrdersApi.create(workOrderData);
        setWorkOrdersData([...workOrdersData, newWorkOrder]);
        showSuccess('Work Order Created', 'New work order has been successfully created');
      } else if (modalMode === 'edit') {
        // Update existing work order
        const updatedWorkOrder = await workOrdersApi.update(currentWorkOrder.id, workOrderData);
        setWorkOrdersData(workOrdersData.map(wo => 
          wo.id === currentWorkOrder.id ? updatedWorkOrder : wo
        ));
        showSuccess('Work Order Updated', 'Work order has been successfully updated');
      }
      setShowWorkOrderModal(false);
      setCurrentWorkOrder(null);
    } catch (err) {
      console.error('Failed to save work order', err);
      showError('Save Error', `Failed to save work order: ${err.message}`);
    }
  };

  const handleCloseWorkOrderModal = () => {
    setShowWorkOrderModal(false);
    setCurrentWorkOrder(null);
  };

  const handleUpdateWorkOrder = (workOrder) => {
    // In a real app, this would open a modal to update the work order
    showWarning('Work Order Updated', `Work order ${workOrder.id} has been updated`);
  };

  const handleUpdateProgress = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsProgressModalOpen(true);
  };

  const handleProgressSubmit = async (updatedWorkOrder) => {
    try {
      // Update the local state with the updated work order from the API
      const updatedWorkOrders = workOrdersData.map(wo => 
        (wo.id === updatedWorkOrder.id || wo._id === updatedWorkOrder._id)
          ? { 
              ...updatedWorkOrder,
              id: updatedWorkOrder.id || updatedWorkOrder._id,
              _id: updatedWorkOrder._id || updatedWorkOrder.id
            } 
          : wo
      );
      setWorkOrdersData(updatedWorkOrders);
      setIsProgressModalOpen(false);
      showSuccess('Progress Updated', 'Work order progress has been successfully updated');
    } catch (err) {
      console.error('Failed to update work order progress', err);
      showError('Update Error', 'Failed to update work order progress. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="w-12 h-12 text-slate-400 mx-auto animate-spin" />
          <p className="mt-2 text-slate-500">Loading work orders...</p>
        </div>
      </div>
    );
  }

  if (error && !usingMockData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-2 text-red-500">{error}</p>
          <Button className="mt-4" onClick={loadWorkOrders}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Work Orders" 
        subtitle={usingMockData 
          ? "Using mock data - backend unavailable" 
          : "Manage and track all maintenance work orders"
        }
      />
      
      <div className="p-4">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex gap-2">
            <div className="relative">
              <Wrench className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-64"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateWorkOrder}>
            <Plus className="w-4 h-4 mr-2" />
            Create Work Order
          </Button>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setPriorityFilter('all');
                setStatusFilter('all');
                setTypeFilter('all');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Showing {filteredWorkOrders.length} of {workOrdersData.length} work orders
          </p>
        </div>

        {/* Work Orders List */}
        <div className="space-y-4">
          {filteredWorkOrders.map((workOrder) => (
            <Card key={workOrder.id || workOrder._id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium text-slate-900">{workOrder.id}</span>
                      <Badge className={getPriorityColor(workOrder.priority)}>
                        {workOrder.priority}
                      </Badge>
                      <Badge className={getStatusColor(workOrder.status)}>
                        {workOrder.status}
                      </Badge>
                      <Badge className={getTypeColor(workOrder.type)}>
                        {workOrder.type}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{workOrder.title}</h3>
                    <p className="text-sm text-slate-600">{workOrder.description}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-sm text-slate-600 mb-1">
                      <User className="w-4 h-4" />
                      <span>{workOrder.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDetails(workOrder)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleEditWorkOrder(workOrder)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUpdateProgress(workOrder)}
                  >
                    Update Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWorkOrders.length === 0 && (
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No work orders found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={() => {
                setPriorityFilter('all');
                setStatusFilter('all');
                setTypeFilter('all');
                setSearchTerm('');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Work Order Modal */}
      <WorkOrderModal
        isOpen={showWorkOrderModal}
        onClose={handleCloseWorkOrderModal}
        onSave={handleSaveWorkOrder}
        workOrder={currentWorkOrder}
        mode={modalMode}
      />

      {/* Progress Update Modal */}
      <ProgressUpdateModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        onSubmit={handleProgressSubmit}
        workOrder={selectedWorkOrder}
      />

      {/* Work Order Detail Modal */}
      <WorkOrderDetailModal
        isOpen={modalMode === 'view' && showWorkOrderModal}
        onClose={handleCloseWorkOrderModal}
        workOrder={currentWorkOrder}
        onEdit={handleEditWorkOrder}
      />
    </div>
  );
};

export default WorkOrders;