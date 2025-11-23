import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  User, 
  Wrench,
  FileText,
  Hash,
  CheckCircle
} from 'lucide-react';

const WorkOrderDetailModal = ({ isOpen, onClose, workOrder }) => {
  if (!workOrder) return null;

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

  const calculateProgress = () => {
    if (workOrder.actualTime && workOrder.estimatedTime) {
      return Math.round((workOrder.actualTime / workOrder.estimatedTime) * 100);
    }
    return 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Work Order Details</span>
            <Badge className={getStatusColor(workOrder.status)}>
              {workOrder.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Header Information */}
          <div className="border-b pb-4">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-500" />
                <span className="font-mono text-lg font-bold text-slate-900">
                  {workOrder.workOrderNumber || workOrder._id || workOrder.id}
                </span>
              </div>
              <Badge className={getPriorityColor(workOrder.priority)}>
                {workOrder.priority}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {workOrder.type}
              </Badge>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {workOrder.title}
            </h2>
            
            <p className="text-slate-600">
              {workOrder.description}
            </p>
          </div>
          
          {/* Progress Section */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-slate-500" />
              <h3 className="text-lg font-semibold text-slate-900">Progress</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500 mb-1">Estimated Time</p>
                <p className="text-sm font-bold text-slate-900">
                  {workOrder.estimatedTime ? `${workOrder.estimatedTime} hours` : 'N/A'}
                </p>
              </div>
              
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500 mb-1">Actual Time</p>
                <p className="text-sm font-bold text-slate-900">
                  {workOrder.actualTime ? `${workOrder.actualTime} hours` : '0 hours'}
                </p>
              </div>
              
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500 mb-1">Completion</p>
                <p className="text-sm font-bold text-slate-900">
                  {calculateProgress()}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Assigned To</p>
                  <p className="font-medium">
                    {workOrder.assignedTo || 'Unassigned'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium">{workOrder.location}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Wrench className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Asset</p>
                  <p className="font-medium">
                    {workOrder.assetName || workOrder.assetId || 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Due Date</p>
                  <p className="font-medium">
                    {workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Estimated Time</p>
                  <p className="font-medium">
                    {workOrder.estimatedTime ? `${workOrder.estimatedTime} hours` : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Cost</p>
                  <p className="font-medium">
                    {workOrder.cost ? `LKR ${workOrder.cost}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notes Section */}
          {(workOrder.notes || workOrder.notes === '') && (
            <div className="border-t pt-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-500 mb-2">Notes</p>
                  <p className="font-medium">
                    {workOrder.notes || 'No additional notes'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer Actions */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderDetailModal;