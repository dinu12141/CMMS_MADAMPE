import React from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Download,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { analytics } from '../mockData';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics = () => {
  // Format cost trends data for the chart
  const costTrendsData = analytics.costTrends.map(trend => ({
    ...trend,
    formattedCost: `LKR ${(trend.cost / 1000).toFixed(1)}k`
  }));
  
  // Calculate percentage change for trend indicators
  const calculateTrend = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };
  
  // Get the last two months for trend calculation
  const lastTwoMonths = analytics.costTrends.slice(-2);
  const trendPercentage = lastTwoMonths.length === 2 ? 
    calculateTrend(lastTwoMonths[1].cost, lastTwoMonths[0].cost) : 0;

  // Custom tooltip for the cost trends chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-bold text-slate-900">{label}</p>
          <p className="text-sm text-slate-600">
            Cost: <span className="font-bold text-blue-600">LKR {payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {payload[0].payload.formattedCost}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom dot for the line chart
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill="#3B82F6" stroke="#fff" strokeWidth={2} />
        <text 
          x={cx} 
          y={cy - 15} 
          textAnchor="middle" 
          fill="#374151" 
          fontSize={12} 
          fontWeight="bold"
        >
          {payload.formattedCost}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Analytics & Reports" 
        subtitle="Insights and performance metrics for maintenance operations"
      />
      
      <div className="p-8">
        <div className="flex justify-end mb-6">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Cost Trends */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Maintenance Cost Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={costTrendsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `LKR ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={<CustomDot />}
                    activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                    name="Maintenance Cost"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Current Month Cost</p>
                <p className="text-2xl font-bold text-slate-900">
                  LKR {analytics.costTrends[analytics.costTrends.length - 1].cost.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center">
                <TrendingUp className={`w-5 h-5 mr-1 ${trendPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`font-bold ${trendPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trendPercentage >= 0 ? '+' : ''}{trendPercentage}%
                </span>
                <span className="text-sm text-slate-600 ml-1">from previous month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Work Order Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Work Order Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Completed On Time</p>
                      <p className="text-2xl font-bold text-slate-900">89</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">89%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Overdue</p>
                      <p className="text-2xl font-bold text-slate-900">7</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-600">7%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">In Progress</p>
                      <p className="text-2xl font-bold text-slate-900">18</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">18%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preventive vs Corrective */}
          <Card>
            <CardHeader>
              <CardTitle>Preventive vs Corrective Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Preventive Maintenance</span>
                    <span className="text-sm font-bold text-green-600">{analytics.thisMonth.preventiveVsCorrective.preventive}%</span>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-end pr-3"
                      style={{ width: `${analytics.thisMonth.preventiveVsCorrective.preventive}%` }}
                    >
                      <span className="text-white text-xs font-bold">65%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Corrective Maintenance</span>
                    <span className="text-sm font-bold text-orange-600">{analytics.thisMonth.preventiveVsCorrective.corrective}%</span>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 flex items-center justify-end pr-3"
                      style={{ width: `${analytics.thisMonth.preventiveVsCorrective.corrective}%` }}
                    >
                      <span className="text-white text-xs font-bold">35%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg mt-6">
                  <p className="text-sm text-blue-900 mb-1 font-medium">Recommendation</p>
                  <p className="text-sm text-blue-700">
                    Your preventive maintenance ratio is excellent! Maintain this level to reduce unexpected failures and costs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Equipment Downtime */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment Downtime Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.downtimeByAsset.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">{item.asset}</span>
                      <span className="text-sm font-bold text-red-600">{item.hours}h</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                        style={{ width: `${(item.hours / 48) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Maintenance Cost</p>
                  <p className="text-2xl font-bold text-slate-900">LKR {analytics.thisMonth.totalCost.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Avg Cost per WO</p>
                  <p className="text-2xl font-bold text-slate-900">LKR 768</p>
                  <p className="text-xs text-green-600 mt-1">-5% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Labor Efficiency</p>
                  <p className="text-2xl font-bold text-slate-900">92%</p>
                  <p className="text-xs text-green-600 mt-1">+3% improvement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;