import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Package, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2,
  Hash,
  Wrench
} from 'lucide-react';

const PMDetailViewModal = ({ isOpen, onClose, pm }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!pm) return null;

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'daily': return 'bg-blue-100 text-blue-700';
      case 'weekly': return 'bg-purple-100 text-purple-700';
      case 'monthly': return 'bg-green-100 text-green-700';
      case 'quarterly': return 'bg-orange-100 text-orange-700';
      case 'yearly': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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

  const calculateDaysUntil = (dateString) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = calculateDaysUntil(pm.nextDue);
  const isOverdue = daysUntil < 0;
  const isDueSoon = daysUntil >= 0 && daysUntil <= 7;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="block text-lg">{pm.name}</span>
              <span className="text-sm text-slate-500 font-mono">{pm.pmNumber || pm.id}</span>
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
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'tasks' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
        </div>

        <ScrollArea className="h-[60vh] pr-4">
          {activeTab === 'details' && (
            <div className="space-y-6 py-4">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={getFrequencyColor(pm.frequency)}>
                  {pm.frequency}
                </Badge>
                <Badge className={getPriorityColor(pm.priority)}>
                  {pm.priority}
                </Badge>
                {pm.active && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                )}
                <Badge className={isOverdue ? 'bg-red-100 text-red-700' : isDueSoon ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}>
                  {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Scheduled'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Asset Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Asset Name</p>
                          <p className="font-medium">{pm.assetName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Asset ID</p>
                          <p className="font-medium">{pm.assetId}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Assignment</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Assigned To</p>
                          <p className="font-medium">{pm.assignedTo}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Schedule Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Last Completed</p>
                          <p className="font-medium">
                            {pm.lastCompleted ? new Date(pm.lastCompleted).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Next Due</p>
                          <p className={`font-medium ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-slate-900'}`}>
                            {new Date(pm.nextDue).toLocaleDateString()}
                            {isOverdue && ' (Overdue)'}
                            {isDueSoon && !isOverdue && ` (${daysUntil} days)`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Estimated Duration</p>
                          <p className="font-medium">{pm.estimatedDuration} hours</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {pm.partsRequired && pm.partsRequired.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-2">Parts Required</h3>
                      <div className="flex flex-wrap gap-2">
                        {pm.partsRequired.map((part, index) => (
                          <Badge key={index} variant="secondary">
                            {part}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="py-4">
              <h3 className="text-sm font-medium text-slate-500 mb-3">Task Checklist</h3>
              {pm.tasks && pm.tasks.length > 0 ? (
                <div className="space-y-3">
                  {pm.tasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{task}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No tasks defined for this PM schedule.</p>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            Generate Work Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PMDetailViewModal;