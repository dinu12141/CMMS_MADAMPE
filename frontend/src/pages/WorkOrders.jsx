import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Plus, 
  Filter, 
  Clock, 
  User, 
  MapPin,
  DollarSign,
  Search,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import { workOrdersApi } from '../services/api';
import { workOrders as mockWorkOrders } from '../mockData';
import WorkOrderModal from '../components/WorkOrderModal';
import WorkOrderDetailModal from '../components/WorkOrderDetailModal';

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  // Fetch work orders from backend or use mock data
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await workOrdersApi.getAll();
        setWorkOrders(data);
        setUseMockData(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching work orders:', err);
        // Fallback to mock data
        setWorkOrders(mockWorkOrders);
        setUseMockData(true);
        setError('Unable to connect to the backend. Displaying mock data.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, [refreshFlag]);

  // Filter work orders based on status and search term
  useEffect(() => {
    let result = workOrders;
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(wo => wo.status === filter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(wo => 
        (wo.title && wo.title.toLowerCase().includes(term)) ||
        (wo.workOrderNumber && wo.workOrderNumber.toLowerCase().includes(term)) ||
        (wo.id && wo.id.toLowerCase().includes(term)) || // For mock data
        (wo.description && wo.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredOrders(result);
  }, [workOrders, filter, searchTerm]);

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
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'open': return 'bg-gray-100 text-gray-700';
      case 'scheduled': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statusCounts = {
    all: workOrders.length,
    open: workOrders.filter(wo => wo.status === 'open').length,
    'in-progress': workOrders.filter(wo => wo.status === 'in-progress').length,
    scheduled: workOrders.filter(wo => wo.status === 'scheduled').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length
  };

  const handleCreateWorkOrder = () => {
    setModalMode('create');
    setSelectedWorkOrder(null);
    setIsModalOpen(true);
  };

  const handleEditWorkOrder = (workOrder) => {
    setModalMode('edit');
    setSelectedWorkOrder(workOrder);
    setIsModalOpen(true);
  };

  const handleViewDetails = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsDetailModalOpen(true);
  };

  const handleDeleteWorkOrder = async (id) => {
    if (useMockData) {
      alert('Delete functionality is not available with mock data.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this work order?')) {
      try {
        await workOrdersApi.delete(id);
        // Trigger refresh
        setRefreshFlag(prev => !prev);
      } catch (err) {
        console.error('Error deleting work order:', err);
        alert('Failed to delete work order. Please try again.');
      }
    }
  };

  const handleModalSubmit = async (workOrderData) => {
    if (useMockData) {
      alert('CRUD operations are not available with mock data. Please start the backend server to enable full functionality.');
      setIsModalOpen(false);
      return;
    }
    
    try {
      if (modalMode === 'create') {
        await workOrdersApi.create(workOrderData);
      } else {
        await workOrdersApi.update(selectedWorkOrder._id, workOrderData);
      }
      
      // Close modal and refresh data
      setIsModalOpen(false);
      setRefreshFlag(prev => !prev);
    } catch (err) {
      console.error('Error saving work order:', err);
      alert(`Failed to ${modalMode === 'create' ? 'create' : 'update'} work order. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading work orders...</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateWorkOrder}>
            <Plus className="w-4 h-4 mr-2" />
            New Work Order
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            {useMockData && (
              <p className="text-red-600 mt-2 text-sm">
                Please start the backend server to enable full functionality. 
                Run: <code className="bg-red-100 px-1 rounded">python -m uvicorn server:app --reload</code> in the backend directory.
              </p>
            )}
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'open', 'in-progress', 'scheduled', 'completed'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status)}
              className="capitalize whitespace-nowrap"
            >
              {status.replace('-', ' ')}
              <Badge variant="secondary" className="ml-2">
                {statusCounts[status]}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Work Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((wo) => (
            <Card key={wo._id || wo.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="font-mono text-lg font-bold text-slate-900">{wo.workOrderNumber || wo.id}</span>
                      <Badge className={getPriorityColor(wo.priority)}>
                        {wo.priority}
                      </Badge>
                      <Badge className={getStatusColor(wo.status)}>
                        {wo.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {wo.type}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{wo.title}</h3>
                    <p className="text-slate-600 mb-4">{wo.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Assigned To</p>
                          <p className="text-sm font-medium text-slate-900">{wo.assignedTo || 'Unassigned'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Location</p>
                          <p className="text-sm font-medium text-slate-900">{wo.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Due Date</p>
                          <p className="text-sm font-medium text-slate-900">
                            {wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Cost</p>
                          <p className="text-sm font-medium text-slate-900">LKR {wo.cost || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(wo)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditWorkOrder(wo)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {!useMockData && (
                      <Button variant="outline" size="sm" onClick={() => handleDeleteWorkOrder(wo._id || wo.id)}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">
              {workOrders.length === 0 
                ? "No work orders found. Create your first work order to get started." 
                : "No work orders found matching your criteria."}
            </p>
            {workOrders.length === 0 && (
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={handleCreateWorkOrder}>
                <Plus className="w-4 h-4 mr-2" />
                Create Work Order
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Work Order Detail Modal */}
      <WorkOrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        workOrder={selectedWorkOrder}
      />

      {/* Work Order Modal */}
      <WorkOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        workOrder={selectedWorkOrder}
        mode={modalMode}
      />
    </div>
  );
};

export default WorkOrders;