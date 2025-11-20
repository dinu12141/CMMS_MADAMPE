import React, { useState } from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Plus, 
  FileText,
  User,
  MapPin,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { serviceRequests } from '../mockData';

const ServiceRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRequests = serviceRequests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'assigned': return 'bg-purple-100 text-purple-700';
      case 'converted': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statusCounts = {
    all: serviceRequests.length,
    open: serviceRequests.filter(r => r.status === 'open').length,
    assigned: serviceRequests.filter(r => r.status === 'assigned').length,
    converted: serviceRequests.filter(r => r.status === 'converted').length
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Service Requests" 
        subtitle="Manage incoming service and maintenance requests"
      />
      
      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'open', 'assigned', 'converted'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
              <Badge variant="secondary" className="ml-2">
                {statusCounts[status]}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-mono text-sm font-medium text-slate-600">{request.id}</span>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge variant="outline">
                        {request.category}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{request.title}</h3>
                    <p className="text-slate-600 mb-4">{request.description}</p>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Requested By</p>
                          <p className="text-sm font-medium text-slate-900">{request.requestedBy}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Location</p>
                          <p className="text-sm font-medium text-slate-900">{request.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Created</p>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(request.createdDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Department</p>
                          <p className="text-sm font-medium text-slate-900">{request.department}</p>
                        </div>
                      </div>
                    </div>

                    {request.assignedTo && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <CheckCircle className="inline w-4 h-4 mr-1" />
                          Assigned to: <span className="font-medium">{request.assignedTo}</span>
                        </p>
                      </div>
                    )}

                    {request.convertedToWO && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-900">
                          <CheckCircle className="inline w-4 h-4 mr-1" />
                          Converted to Work Order: <span className="font-medium">{request.convertedToWO}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {request.status === 'open' && (
                      <>
                        <Button variant="outline" size="sm">Assign</Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Convert to WO</Button>
                      </>
                    )}
                    {request.status === 'assigned' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Convert to WO</Button>
                        <Button variant="outline" size="sm">
                          <XCircle className="w-4 h-4 mr-1" />
                          Close
                        </Button>
                      </>
                    )}
                    {request.status === 'converted' && (
                      <Button variant="outline" size="sm">View Work Order</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No service requests found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRequests;
