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
  Clock,
  Loader2,
  Calendar as CalendarIcon,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { workOrdersApi, assetsApi, pmApi } from '../services/api';
import { workOrders as mockWorkOrders, assets as mockAssets } from '../mockData';
import { format, parseISO, isSameDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const Dashboard = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [preventiveMaintenance, setPreventiveMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [costTrendData, setCostTrendData] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch real data from backend with fallback to mock data
  // Fetch real data from backend with fallback to mock data
  const fetchData = async () => {
    try {
      // Only set loading on initial fetch
      if (workOrders.length === 0) setLoading(true);

      const [workOrdersData, assetsData, pmData] = await Promise.all([
        workOrdersApi.getAll(),
        assetsApi.getAll(),
        pmApi.getAll()
      ]);
      setWorkOrders(workOrdersData);
      setAssets(assetsData);
      setPreventiveMaintenance(pmData);
      setUsingMockData(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data from backend:', err);
      // Fallback to mock data if we haven't loaded data yet
      if (workOrders.length === 0) {
        setWorkOrders(mockWorkOrders);
        setAssets(mockAssets);
        setPreventiveMaintenance([]);
        setUsingMockData(true);
        setError('Using mock data - backend unavailable');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Poll for updates every 30 seconds
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Process data for charts
  useEffect(() => {
    if (loading) return;

    // 1. Maintenance Cost Trends (AreaChart)
    // Aggregate cost by month
    const costsByMonth = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize current year months
    const currentYear = new Date().getFullYear();
    months.forEach(month => {
      costsByMonth[month] = 0;
    });

    workOrders.forEach(wo => {
      if (wo.cost && (wo.createdDate || wo.createdAt)) {
        const date = new Date(wo.createdDate || wo.createdAt);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth();
          costsByMonth[months[monthIndex]] += wo.cost;
        }
      }
    });

    const trendData = months.map(month => ({
      name: month,
      cost: costsByMonth[month]
    }));
    setCostTrendData(trendData);

    // 2. Work Order Status (Horizontal Bar Chart)
    const statusCounts = workOrders.reduce((acc, wo) => {
      const status = wo.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      value: count,
      status: status
    })).sort((a, b) => b.value - a.value); // Sort by count descending

    setStatusChartData(statusData);

  }, [workOrders, loading]);

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

  const getStatusChartColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#10B981'; // green
      case 'in-progress': return '#3B82F6'; // blue
      case 'open': return '#9CA3AF'; // gray
      case 'scheduled': return '#8B5CF6'; // purple
      default: return '#6B7280'; // default gray
    }
  };

  // Calendar Modifiers
  const workOrderDates = workOrders
    .filter(wo => wo.dueDate && wo.status !== 'completed')
    .map(wo => new Date(wo.dueDate));

  const pmDates = preventiveMaintenance
    .filter(pm => pm.nextDueDate)
    .map(pm => new Date(pm.nextDueDate));

  const modifiers = {
    workOrder: workOrderDates,
    pm: pmDates
  };

  const modifiersStyles = {
    workOrder: { color: '#ef4444', fontWeight: 'bold' }, // Red for Work Orders
    pm: { color: '#3b82f6', fontWeight: 'bold' } // Blue for PMs
  };

  // Custom Day Content for Calendar
  const DayContent = (props) => {
    const { date, activeModifiers } = props;
    const dayWorkOrders = workOrders.filter(wo =>
      wo.dueDate && isSameDay(new Date(wo.dueDate), date) && wo.status !== 'completed'
    );
    const dayPMs = preventiveMaintenance.filter(pm =>
      pm.nextDueDate && isSameDay(new Date(pm.nextDueDate), date)
    );

    const hasWorkOrders = dayWorkOrders.length > 0;
    const hasPMs = dayPMs.length > 0;

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{date.getDate()}</span>
        <div className="absolute bottom-1 flex gap-1">
          {hasWorkOrders && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
          {hasPMs && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
        </div>
      </div>
    );
  };

  // Get tasks for selected date
  const getTasksForDate = (date) => {
    if (!date) return { workOrders: [], pms: [] };

    const wos = workOrders.filter(wo =>
      wo.dueDate && isSameDay(new Date(wo.dueDate), date)
    );
    const pms = preventiveMaintenance.filter(pm =>
      pm.nextDueDate && isSameDay(new Date(pm.nextDueDate), date)
    );

    return { workOrders: wos, pms };
  };

  const selectedTasks = getTasksForDate(selectedDate);

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
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header
        title="Dashboard"
        subtitle={usingMockData
          ? "Using mock data - backend unavailable"
          : "Overview of your maintenance operations."
        }
      />

      <div className="p-8 space-y-8">
        {/* Top Row: Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Middle Row: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maintenance Cost Trends */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Maintenance Cost Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={costTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `LKR ${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Cost']}
                  />
                  <Area type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Work Order Status */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Work Order Status</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusChartColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Smart Maintenance Calendar */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="border-b border-slate-100 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Smart Maintenance Calendar
              </CardTitle>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-600">Work Orders Due</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-600">PM Scheduled</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row h-[600px]">
              {/* Calendar View */}
              <div className="flex-1 p-6 border-r border-slate-100 flex items-center justify-center bg-white/30">
                <style>{`
                  .rdp { --rdp-cell-size: 50px; --rdp-accent-color: #3b82f6; margin: 0; }
                  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f1f5f9; }
                  .rdp-day_selected { background-color: #3b82f6; color: white; }
                  .rdp-day_today { font-weight: bold; color: #3b82f6; }
                `}</style>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  components={{
                    DayContent: DayContent
                  }}
                  className="bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/20"
                />
              </div>

              {/* Tasks List for Selected Date */}
              <div className="w-full lg:w-96 bg-slate-50/50 p-6 overflow-y-auto">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center justify-between">
                  <span>Tasks for {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Selected Date'}</span>
                  <Badge variant="outline" className="bg-white">
                    {selectedTasks.workOrders.length + selectedTasks.pms.length} Tasks
                  </Badge>
                </h3>

                <div className="space-y-4">
                  {selectedTasks.workOrders.length === 0 && selectedTasks.pms.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No tasks scheduled for this day</p>
                    </div>
                  )}

                  {selectedTasks.workOrders.map(wo => (
                    <div key={wo._id || wo.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant="outline" className="text-xs border-red-200 text-red-700 bg-red-50">Work Order</Badge>
                        <span className="text-xs text-slate-500 font-mono">{wo.workOrderNumber}</span>
                      </div>
                      <h4 className="font-medium text-slate-900 mb-1">{wo.title}</h4>
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>{wo.priority}</span>
                        <span className="capitalize">{wo.status}</span>
                      </div>
                    </div>
                  ))}

                  {selectedTasks.pms.map(pm => (
                    <div key={pm._id || pm.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">Preventive Maint.</Badge>
                        <span className="text-xs text-slate-500 font-mono">{pm.frequency}</span>
                      </div>
                      <h4 className="font-medium text-slate-900 mb-1">{pm.assetName || 'Asset Maintenance'}</h4>
                      <p className="text-sm text-slate-500 line-clamp-2">{pm.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;