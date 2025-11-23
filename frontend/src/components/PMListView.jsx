import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Clock,
  User,
  CheckCircle2,
  Package
} from 'lucide-react';

const PMListView = ({ preventiveMaintenance, onViewDetails, onGenerateWO }) => {
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {preventiveMaintenance.map((pm) => {
          const daysUntil = calculateDaysUntil(pm.nextDue);
          const isOverdue = daysUntil < 0;
          const isDueSoon = daysUntil >= 0 && daysUntil <= 7;

          return (
            <Card 
              key={pm.id} 
              className={`hover:shadow-md transition-all duration-200 ${
                isOverdue ? 'border-red-300 border-2' : isDueSoon ? 'border-orange-300 border-2' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-medium text-slate-600">{pm.id}</span>
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
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{pm.name}</h3>
                    <p className="text-sm text-slate-600 mb-2 flex items-center">
                      <Package className="inline w-4 h-4 mr-1" />
                      {pm.assetName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-slate-900'
                    }`}>
                      {new Date(pm.nextDue).toLocaleDateString()}
                      {isOverdue && ' (Overdue)'}
                      {isDueSoon && !isOverdue && ` (${daysUntil}d)`}
                    </p>
                    <p className="text-xs text-slate-500">
                      Due in {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 pb-3 border-b border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Last Completed</p>
                    <p className="text-sm font-medium text-slate-900">
                      {pm.lastCompleted ? new Date(pm.lastCompleted).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Assigned To</p>
                    <p className="text-sm font-medium text-slate-900 flex items-center">
                      <User className="inline w-4 h-4 mr-1" />
                      {pm.assignedTo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Est. Duration</p>
                    <p className="text-sm font-medium text-slate-900 flex items-center">
                      <Clock className="inline w-4 h-4 mr-1" />
                      {pm.estimatedDuration}h
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tasks</p>
                    <p className="text-sm font-medium text-slate-900">
                      {pm.tasks.length} task{pm.tasks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewDetails(pm)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onGenerateWO(pm)}
                  >
                    Generate WO
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PMListView;