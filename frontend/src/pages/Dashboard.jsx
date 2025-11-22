import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  ClipboardList, 
  Package, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { analytics, workOrders } from '../mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [workOrderData, setWorkOrderData] = useState([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState(workOrders);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Filter work orders based on status
  const filterWorkOrders = (status) => {
    setActiveFilter(status);
    if (status === 'all') {
      setFilteredWorkOrders(workOrders);
    } else {
      setFilteredWorkOrders(workOrders.filter(wo => wo.status === status));
    }
  };
  
  // Initialize work order data
  useEffect(() => {
    const statusCounts = filteredWorkOrders.reduce((acc, wo) => {
      acc[wo.status] = (acc[wo.status] || 0) + 1;
      return acc;
    }, {});
    
    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      value: count,
      status: status
    }));
    
    setWorkOrderData(chartData);
  }, [filteredWorkOrders]);
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would fetch updated data from the backend
      // For now, we'll just simulate changes
      const statusCounts = filteredWorkOrders.reduce((acc, wo) => {
        acc[wo.status] = (acc[wo.status] || 0) + 1;
        return acc;
      }, {});
      
      const chartData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
        value: count,
        status: status
      }));
      
      setWorkOrderData(chartData);
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [filteredWorkOrders]);

  const recentWorkOrders = workOrders.slice(0, 5);

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
  
  const getStatusChartColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981'; // green
      case 'in-progress': return '#3B82F6'; // blue
      case 'open': return '#9CA3AF'; // gray
      case 'scheduled': return '#8B5CF6'; // purple
      default: return '#6B7280'; // default gray
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's an overview of your maintenance operations."
      />
      
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Work Orders"
            value={analytics.workOrderStats.total}
            icon={ClipboardList}
            trend="up"
            trendValue="+12%"
            iconColor="bg-blue-500"
            navigateTo="/work-orders"
          />
          <StatCard
            title="Open Work Orders"
            value={analytics.workOrderStats.open}
            icon={Clock}
            iconColor="bg-orange-500"
            navigateTo="/work-orders"
          />
          <StatCard
            title="Assets Tracked"
            value="100"
            icon={Package}
            trend="up"
            trendValue="+5%"
            iconColor="bg-purple-500"
            navigateTo="/assets"
          />
          <StatCard
            title="Overdue Tasks"
            value={analytics.workOrderStats.overdue}
            icon={AlertTriangle}
            trend="down"
            trendValue="-3%"
            iconColor="bg-red-500"
            navigateTo="/work-orders"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Work Orders */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle>Recent Work Orders</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentWorkOrders.map((wo) => (
                  <div key={wo.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-medium text-slate-900">{wo.id}</span>
                        <Badge className={getPriorityColor(wo.priority)}>
                          {wo.priority}
                        </Badge>
                        <Badge className={getStatusColor(wo.status)}>
                          {wo.status}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-slate-900 mb-1">{wo.title}</h4>
                      <p className="text-sm text-slate-600">
                        Assigned to: {wo.assignedTo} • {wo.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Due</p>
                      <p className="font-medium text-slate-900">
                        {new Date(wo.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Work Order Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Work Order Status</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button 
                    variant={activeFilter === 'all' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => filterWorkOrders('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={activeFilter === 'open' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => filterWorkOrders('open')}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Open
                  </Button>
                  <Button 
                    variant={activeFilter === 'in-progress' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => filterWorkOrders('in-progress')}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    In Progress
                  </Button>
                  <Button 
                    variant={activeFilter === 'scheduled' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => filterWorkOrders('scheduled')}
                    className="bg-purple-100 text-purple-700 hover:bg-purple-200"
                  >
                    Scheduled
                  </Button>
                  <Button 
                    variant={activeFilter === 'completed' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => filterWorkOrders('completed')}
                    className="bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    Completed
                  </Button>
                </div>
                
                {/* Bar Chart */}
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={workOrderData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Work Orders']}
                      labelFormatter={(label) => `Status: ${label}`}
                    />
                    <Bar dataKey="value" name="Work Orders">
                      {workOrderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusChartColor(entry.status)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* This Month Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-slate-600">Completed WOs</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">{analytics.thisMonth.completedWOs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-slate-600">Total Cost</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">LKR {analytics.thisMonth.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-slate-600">Avg Completion</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">{analytics.thisMonth.avgCompletionTime}h</span>
                </div>
              </CardContent>
            </Card>

            {/* Asset Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Asset Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Operational</span>
                      <span className="font-medium text-green-600">{analytics.assetHealth.operational}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${analytics.assetHealth.operational}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Maintenance</span>
                      <span className="font-medium text-orange-600">{analytics.assetHealth.maintenance}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${analytics.assetHealth.maintenance}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Degraded</span>
                      <span className="font-medium text-yellow-600">{analytics.assetHealth.degraded}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: `${analytics.assetHealth.degraded}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Offline</span>
                      <span className="font-medium text-red-600">{analytics.assetHealth.offline}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${analytics.assetHealth.offline}%` }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;