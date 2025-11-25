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

const WorkOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [workOrdersData, setWorkOrdersData] = useState([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
      
      // Show a notification when work orders are loaded
      showSuccess('Work Orders Loaded', `Successfully loaded ${data.length} work orders`);
    } catch (err) {
      console.error('Failed to load work orders', err);
      showError('Load Error', 'Failed to load work orders. Please try again.');
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
      
      // Show success notification with the actual progress percentage
      const progressPercentage = updatedWorkOrder.actualTime && updatedWorkOrder.estimatedTime 
        ? Math.round((updatedWorkOrder.actualTime / updatedWorkOrder.estimatedTime) * 100)
        : 0;
      
      showSuccess('Progress Updated', `Work order ${updatedWorkOrder.workOrderNumber || updatedWorkOrder.id} progress updated to ${progressPercentage}%`);
      
      // Close the modal
      setIsProgressModalOpen(false);
      setSelectedWorkOrder(null);
    } catch (error) {
      console.error('Failed to update work order progress:', error);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Work Orders" 
        subtitle="Manage and track all maintenance work orders"
      />
      
      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80"
            />
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" onClick={handleCreateWorkOrder}>
            <Plus className="w-4 h-4 mr-2" />
            Create Work Order
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>
                {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          
          <Button 
            variant="outline" 
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

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Showing {filteredWorkOrders.length} of {workOrdersData.length} work orders
          </p>
        </div>

        {/* Work Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWorkOrders.map((wo) => (
            <Card key={wo.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{wo.title}</h3>
                        <Badge className={getPriorityColor(wo.priority)}>
                          {wo.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{wo.description}</p>
                      <p className="text-xs text-slate-500 font-mono">{wo.id}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(wo.status)}>
                    {wo.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Asset</p>
                    <p className="text-sm font-medium text-slate-900">{wo.assetName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Type</p>
                    <Badge variant="secondary" className={getTypeColor(wo.type)}>
                      {wo.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Assigned To</p>
                    <p className="text-sm font-medium text-slate-900 flex items-center">
                      <User className="w-4 h-4 mr-1 text-slate-400" />
                      {wo.assignedTo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Due Date</p>
                    <p className="text-sm font-medium text-slate-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                      {new Date(wo.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500 mb-1">Est. Time</p>
                    <p className="text-sm font-bold text-slate-900">{wo.estimatedTime}h</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500 mb-1">Cost</p>
                    <p className="text-sm font-bold text-slate-900">LKR {wo.cost.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500 mb-1">Progress</p>
                    <p className="text-lg font-bold text-slate-900">
                      {wo.actualTime && wo.estimatedTime 
                        ? `${Math.round((wo.actualTime / wo.estimatedTime) * 100)}%` 
                        : '0%'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDetails(wo)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleUpdateProgress(wo)}
                  >
                    Update Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWorkOrders.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No work orders found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
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
      
      <ProgressUpdateModal
        isOpen={isProgressModalOpen}
        onClose={() => {
          setIsProgressModalOpen(false);
          setSelectedWorkOrder(null);
        }}
        workOrder={selectedWorkOrder}
        onSubmit={handleProgressSubmit}
      />
      
      <WorkOrderModal
        isOpen={showWorkOrderModal && (modalMode === 'create' || modalMode === 'edit')}
        onClose={handleCloseWorkOrderModal}
        onSubmit={handleSaveWorkOrder}
        workOrder={currentWorkOrder}
        mode={modalMode}
      />
      
      <WorkOrderDetailModal
        isOpen={showWorkOrderModal && modalMode === 'view'}
        onClose={handleCloseWorkOrderModal}
        workOrder={currentWorkOrder}
      />
    </div>
  );
};

export default WorkOrders;