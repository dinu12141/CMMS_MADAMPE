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
  Clock,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { workOrdersApi, assetsApi } from '../services/api';
import { workOrders as mockWorkOrders, assets as mockAssets } from '../mockData';

const Dashboard = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workOrderData, setWorkOrderData] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Fetch real data from backend with fallback to mock data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [workOrdersData, assetsData] = await Promise.all([
          workOrdersApi.getAll(),
          assetsApi.getAll()
        ]);
        setWorkOrders(workOrdersData);
        setAssets(assetsData);
        setUsingMockData(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data from backend:', err);
        // Fallback to mock data
        setWorkOrders(mockWorkOrders);
        setAssets(mockAssets);
        setUsingMockData(true);
        setError('Using mock data - backend unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter work orders based on status
  const filterWorkOrders = (status) => {
    setActiveFilter(status);
  };

  // Calculate filtered work orders
  const filteredWorkOrders = activeFilter === 'all' 
    ? workOrders 
    : workOrders.filter(wo => wo.status === activeFilter);

  // Initialize work order data for chart
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

  // Calculate real-time stats
  const totalWorkOrders = workOrders.length;
  const openWorkOrders = workOrders.filter(wo => wo.status === 'open').length;
  const assetsTracked = assets.length;
  
  // Calculate overdue tasks (status !== 'completed' AND dueDate < now)
  const overdueTasks = workOrders.filter(wo => {
    if (wo.status === 'completed') return false;
    if (!wo.dueDate) return false;
    const dueDate = new Date(wo.dueDate);
    const now = new Date();
    return dueDate < now;
  }).length;

  // Get recent work orders (top 5, sorted by createdDate descending)
  const recentWorkOrders = [...workOrders]
    .sort((a, b) => new Date(b.createdDate || b.createdAt) - new Date(a.createdDate || a.createdAt))
    .slice(0, 5);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-slate-400 mx-auto animate-spin" />
          <p className="mt-2 text-slate-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && !usingMockData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-2 text-red-500">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Dashboard" 
        subtitle={usingMockData 
          ? "Using mock data - backend unavailable" 
          : "Welcome back! Here's an overview of your maintenance operations."
        }
      />
      
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Work Orders"
            value={totalWorkOrders}
            icon={ClipboardList}
            trend="up"
            trendValue="+12%"
            iconColor="bg-blue-500"
            navigateTo="/work-orders"
          />
          <StatCard
            title="Open Work Orders"
            value={openWorkOrders}
            icon={Clock}
            iconColor="bg-orange-500"
            navigateTo="/work-orders"
          />
          <StatCard
            title="Assets Tracked"
            value={assetsTracked}
            icon={Package}
            trend="up"
            trendValue="+5%"
            iconColor="bg-purple-500"
            navigateTo="/assets"
          />
          <StatCard
            title="Overdue Tasks"
            value={overdueTasks}
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
                  <div key={wo._id || wo.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-medium text-slate-900">{wo.workOrderNumber || wo.id}</span>
                        <Badge className={getPriorityColor(wo.priority)}>
                          {wo.priority}
                        </Badge>
                        <Badge className={getStatusColor(wo.status)}>
                          {wo.status}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-slate-900 mb-1">{wo.title}</h4>
                      <p className="text-sm text-slate-600">
                        Assigned to: {wo.assignedTo || 'Unassigned'} • {wo.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Due</p>
                      <p className="font-medium text-slate-900">
                        {wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : 'N/A'}
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
            
            {/* This Month Summary - Using real data */}
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
                  <span className="text-xl font-bold text-slate-900">
                    {workOrders.filter(wo => 
                      wo.status === 'completed' && 
                      new Date(wo.completedDate || wo.updatedAt).getMonth() === new Date().getMonth() &&
                      new Date(wo.completedDate || wo.updatedAt).getFullYear() === new Date().getFullYear()
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-slate-600">Total Cost</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">
                    LKR {workOrders
                      .filter(wo => 
                        new Date(wo.createdDate || wo.createdAt).getMonth() === new Date().getMonth() &&
                        new Date(wo.createdDate || wo.createdAt).getFullYear() === new Date().getFullYear()
                      )
                      .reduce((sum, wo) => sum + (wo.cost || 0), 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-slate-600">Avg Completion</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">
                    {workOrders.filter(wo => wo.status === 'completed' && wo.actualTime).length > 0
                      ? (workOrders
                          .filter(wo => wo.status === 'completed' && wo.actualTime)
                          .reduce((sum, wo) => sum + wo.actualTime, 0) / 
                         workOrders.filter(wo => wo.status === 'completed' && wo.actualTime).length)
                          .toFixed(1) + 'h'
                      : '0h'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Asset Health - Using real data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Asset Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Operational</span>
                      <span className="font-medium text-green-600">
                        {assets.length > 0 
                          ? Math.round((assets.filter(a => a.status === 'operational').length / assets.length) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ 
                          width: `${assets.length > 0 
                            ? (assets.filter(a => a.status === 'operational').length / assets.length) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Maintenance</span>
                      <span className="font-medium text-orange-600">
                        {assets.length > 0 
                          ? Math.round((assets.filter(a => a.status === 'maintenance').length / assets.length) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500" 
                        style={{ 
                          width: `${assets.length > 0 
                            ? (assets.filter(a => a.status === 'maintenance').length / assets.length) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Degraded</span>
                      <span className="font-medium text-yellow-600">
                        {assets.length > 0 
                          ? Math.round((assets.filter(a => a.status === 'degraded').length / assets.length) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500" 
                        style={{ 
                          width: `${assets.length > 0 
                            ? (assets.filter(a => a.status === 'degraded').length / assets.length) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Offline</span>
                      <span className="font-medium text-red-600">
                        {assets.length > 0 
                          ? Math.round((assets.filter(a => a.status === 'offline').length / assets.length) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500" 
                        style={{ 
                          width: `${assets.length > 0 
                            ? (assets.filter(a => a.status === 'offline').length / assets.length) * 100 
                            : 0}%` 
                        }}
                      ></div>
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