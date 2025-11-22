import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Package, 
  Wrench, 
  Calendar, 
  User, 
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react';

const AssetHistoryModal = ({ isOpen, onClose, asset, historyData }) => {
  const [activeTab, setActiveTab] = useState('workOrders');
  const [history, setHistory] = useState({
    workOrders: [],
    preventiveMaintenance: [],
    serviceRequests: []
  });

  useEffect(() => {
    if (historyData) {
      setHistory({
        workOrders: historyData.workOrders || [],
        preventiveMaintenance: historyData.preventiveMaintenance || [],
        serviceRequests: historyData.serviceRequests || []
      });
    }
  }, [historyData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="block text-lg">History for {asset.name}</span>
              <span className="text-sm text-slate-500 font-mono">{asset.assetNumber || asset.id}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex border-b border-slate-200">
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'workOrders' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('workOrders')}
          >
            <Wrench className="w-4 h-4" />
            Work Orders ({history.workOrders.length})
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'preventiveMaintenance' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('preventiveMaintenance')}
          >
            <CheckCircle className="w-4 h-4" />
            Preventive Maintenance ({history.preventiveMaintenance.length})
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'serviceRequests' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('serviceRequests')}
          >
            <FileText className="w-4 h-4" />
            Service Requests ({history.serviceRequests.length})
          </button>
        </div>

        <ScrollArea className="h-[60vh] pr-4">
          {activeTab === 'workOrders' && (
            <div className="py-4 space-y-4">
              {history.workOrders.length > 0 ? (
                history.workOrders.map((wo) => (
                  <div key={wo._id || wo.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{wo.title}</h3>
                        <p className="text-sm text-slate-500">{wo.workOrderNumber || wo.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(wo.priority)}>
                          {wo.priority}
                        </Badge>
                        <Badge className={getStatusColor(wo.status)}>
                          {wo.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">{wo.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{wo.assignedTo || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                          {wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{wo.estimatedTime} hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span>LKR {wo.cost?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No work orders found for this asset.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preventiveMaintenance' && (
            <div className="py-4 space-y-4">
              {history.preventiveMaintenance.length > 0 ? (
                history.preventiveMaintenance.map((pm) => (
                  <div key={pm._id || pm.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{pm.name}</h3>
                        <p className="text-sm text-slate-500">{pm.pmNumber || pm.id}</p>
                      </div>
                      <Badge className={pm.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {pm.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-slate-500">Frequency</p>
                        <p className="font-medium capitalize">{pm.frequency}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Assigned To</p>
                        <p className="font-medium">{pm.assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Next Due</p>
                        <p className="font-medium">
                          {pm.nextDue ? new Date(pm.nextDue).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Estimated Duration</p>
                        <p className="font-medium">{pm.estimatedDuration} hours</p>
                      </div>
                    </div>
                    
                    {pm.tasks && pm.tasks.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-500 mb-2">Tasks:</p>
                        <ul className="text-sm space-y-1">
                          {pm.tasks.map((task, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No preventive maintenance records found for this asset.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'serviceRequests' && (
            <div className="py-4 space-y-4">
              {history.serviceRequests.length > 0 ? (
                history.serviceRequests.map((sr) => (
                  <div key={sr._id || sr.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{sr.title}</h3>
                        <p className="text-sm text-slate-500">{sr.requestNumber || sr.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(sr.priority)}>
                          {sr.priority}
                        </Badge>
                        <Badge className={getStatusColor(sr.status)}>
                          {sr.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">{sr.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Requested By</p>
                        <p className="font-medium">{sr.requestedBy}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Department</p>
                        <p className="font-medium">{sr.department}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                          {sr.createdDate ? new Date(sr.createdDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-slate-500">Location</p>
                        <p className="font-medium">{sr.location}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No service requests found for this asset.</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetHistoryModal;