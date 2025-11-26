import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Calendar, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Wrench,
  FileText,
  Factory,
  Tag,
  Hash,
  MapPin,
  DollarSign,
  Package,
  Plus
} from 'lucide-react';
import { workOrdersApi } from '../services/api';
import ProgressUpdateModal from './ProgressUpdateModal';
import PermissionButton from './PermissionButton';

const AssetDetailModal = ({ isOpen, onClose, asset, onEdit }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [relatedWorkOrders, setRelatedWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  // Load related work orders when asset changes
  useEffect(() => {
    const loadRelatedWorkOrders = async () => {
      if (asset && asset.id) {
        try {
          // Fetch real work orders from the API
          const relatedWOs = await workOrdersApi.getByAssetId(asset.id);
          setRelatedWorkOrders(relatedWOs);
        } catch (error) {
          console.error('Failed to load related work orders:', error);
          // Fallback to empty array if API call fails
          setRelatedWorkOrders([]);
        }
      } else {
        setRelatedWorkOrders([]);
      }
    };

    loadRelatedWorkOrders();
  }, [asset]);

  if (!asset) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-700';
      case 'maintenance': return 'bg-orange-100 text-orange-700';
      case 'degraded': return 'bg-yellow-100 text-yellow-700';
      case 'offline': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCriticalityColor = (criticality) => {
    switch (criticality) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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

  const getStatusColorWO = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'open': return 'bg-gray-100 text-gray-700';
      case 'scheduled': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleUpdateProgress = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsProgressModalOpen(true);
  };

  const handleProgressSubmit = (progressData) => {
    // In a real app, this would update the work order via API
    console.log('Updating progress for work order:', selectedWorkOrder.id, progressData);
    
    // Update the local state
    const updatedWorkOrders = relatedWorkOrders.map(wo => 
      wo.id === selectedWorkOrder.id 
        ? { 
            ...wo, 
            status: progressData.status,
            actualTime: progressData.actualTime,
            notes: progressData.notes
          } 
        : wo
    );
    
    setRelatedWorkOrders(updatedWorkOrders);
    
    // Close the modal
    setIsProgressModalOpen(false);
    setSelectedWorkOrder(null);
  };

  const calculateProgress = (workOrder) => {
    if (workOrder.actualTime && workOrder.estimatedTime) {
      return Math.round((workOrder.actualTime / workOrder.estimatedTime) * 100);
    }
    return 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="block text-lg">{asset.name}</span>
              <span className="text-sm text-slate-500 font-mono">{asset.assetNumber || asset.id}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex border-b border-slate-200">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'specifications' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'workOrders' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('workOrders')}
          >
            Work Orders ({relatedWorkOrders.length})
          </button>
        </div>

        <ScrollArea className="h-[60vh] pr-4">
          {activeTab === 'details' && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Basic Information</h3>
                    <div className="space-y-3">
                      {/* Asset Image */}
                      {asset.imageUrl && (
                        <div className="flex justify-center mb-4">
                          <img 
                            src={`http://localhost:8000${asset.imageUrl}`} 
                            alt={asset.name} 
                            className="w-64 h-64 object-contain rounded border"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <Factory className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Manufacturer</p>
                          <p className="font-medium">{asset.manufacturer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Model</p>
                          <p className="font-medium">{asset.model}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Serial Number</p>
                          <p className="font-medium">{asset.serialNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Location</p>
                          <p className="font-medium">{asset.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Status & Condition</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(asset.status)}>
                            {asset.status}
                          </Badge>
                          <Badge className={getCriticalityColor(asset.criticality)}>
                            {asset.criticality} criticality
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm text-slate-500">Condition</p>
                          <p className={`font-medium capitalize ${getConditionColor(asset.condition)}`}>
                            {asset.condition}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Dates</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Purchase Date</p>
                          <p className="font-medium">
                            {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Installation Date</p>
                          <p className="font-medium">
                            {asset.installDate ? new Date(asset.installDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Warranty Expiry</p>
                          <p className="font-medium">
                            {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Wrench className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Last Maintenance</p>
                          <p className="font-medium">
                            {asset.lastMaintenance ? new Date(asset.lastMaintenance).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Wrench className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Next Maintenance</p>
                          <p className="font-medium">
                            {asset.nextMaintenance ? new Date(asset.nextMaintenance).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Metrics</h3>

                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Category</h3>
                <Badge variant="secondary" className="capitalize">
                  {asset.category}
                </Badge>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="py-4">
              <h3 className="text-sm font-medium text-slate-500 mb-3">Technical Specifications</h3>
              {asset.specifications && Object.keys(asset.specifications).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(asset.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-sm text-slate-600">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No specifications available for this asset.</p>
              )}
            </div>
          )}

          {activeTab === 'workOrders' && (
            <div className="py-4">
              <h3 className="text-sm font-medium text-slate-500 mb-3">Related Work Orders</h3>
              {relatedWorkOrders.length > 0 ? (
                <div className="space-y-3">
                  {relatedWorkOrders.map((wo) => (
                    <div key={wo.id} className="border rounded-lg p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-slate-900">{wo.title}</h4>
                          <p className="text-sm text-slate-600">{wo.description}</p>
                        </div>
                        <Badge className={getStatusColorWO(wo.status)}>
                          {wo.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Wrench className="w-4 h-4" />
                          <span>{wo.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {new Date(wo.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{calculateProgress(wo)}% complete</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(wo.priority)}>
                          {wo.priority}
                        </Badge>
                        <span className="text-xs text-slate-500 font-mono">{wo.id}</span>
                      </div>
                      
                      <div className="flex justify-end mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateProgress(wo)}
                        >
                          Update Progress
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No work orders found for this asset.</p>
                  <Button className="mt-3" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Work Order
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <PermissionButton page="assets" onClick={() => onEdit(asset)}>
            Edit Asset
          </PermissionButton>
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
      </DialogContent>
    </Dialog>
  );
};

export default AssetDetailModal;