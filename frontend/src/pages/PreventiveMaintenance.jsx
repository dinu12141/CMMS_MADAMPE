import React from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Package
} from 'lucide-react';
import { preventiveMaintenance } from '../mockData';

const PreventiveMaintenance = () => {
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
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Preventive Maintenance" 
        subtitle="Schedule and manage preventive maintenance tasks"
      />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
            <Button variant="outline">List View</Button>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New PM Schedule
          </Button>
        </div>

        {/* PM Schedule Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {preventiveMaintenance.map((pm) => {
            const daysUntil = calculateDaysUntil(pm.nextDue);
            const isOverdue = daysUntil < 0;
            const isDueSoon = daysUntil >= 0 && daysUntil <= 7;

            return (
              <Card key={pm.id} className={`hover:shadow-lg transition-all duration-200 ${
                isOverdue ? 'border-red-300 border-2' : isDueSoon ? 'border-orange-300 border-2' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
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
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{pm.name}</h3>
                      <p className="text-sm text-slate-600 mb-3">
                        <Package className="inline w-4 h-4 mr-1" />
                        {pm.assetName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Last Completed</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(pm.lastCompleted).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Next Due</p>
                      <p className={`text-sm font-medium ${
                        isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-slate-900'
                      }`}>
                        {new Date(pm.nextDue).toLocaleDateString()}
                        {isOverdue && ' (Overdue)'}
                        {isDueSoon && !isOverdue && ` (${daysUntil}d)`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Assigned To</p>
                      <p className="text-sm font-medium text-slate-900">
                        <User className="inline w-4 h-4 mr-1" />
                        {pm.assignedTo}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Est. Duration</p>
                      <p className="text-sm font-medium text-slate-900">
                        <Clock className="inline w-4 h-4 mr-1" />
                        {pm.estimatedDuration}h
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Tasks Checklist</p>
                    <div className="space-y-2">
                      {pm.tasks.slice(0, 3).map((task, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-slate-400" />
                          {task}
                        </div>
                      ))}
                      {pm.tasks.length > 3 && (
                        <p className="text-xs text-slate-500 ml-6">+{pm.tasks.length - 3} more tasks</p>
                      )}
                    </div>
                  </div>

                  {pm.partsRequired.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-1">Parts Required</p>
                      <p className="text-sm text-blue-700">{pm.partsRequired.join(', ')}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      Generate WO
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PreventiveMaintenance;
