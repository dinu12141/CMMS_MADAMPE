import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import { workOrders } from '../mockData';

const WorkOrders = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = workOrders.filter(wo => {
    const matchesFilter = filter === 'all' || wo.status === filter;
    const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wo.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Work Orders" 
        subtitle="Manage and track all maintenance work orders"
      />
      
      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Work Order
          </Button>
        </div>

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
            <Card key={wo.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-lg font-bold text-slate-900">{wo.id}</span>
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
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Assigned To</p>
                          <p className="text-sm font-medium text-slate-900">{wo.assignedTo}</p>
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
                            {new Date(wo.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Cost</p>
                          <p className="text-sm font-medium text-slate-900">${wo.cost}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No work orders found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrders;
