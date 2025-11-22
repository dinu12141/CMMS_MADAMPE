import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  Package, 
  Wrench,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const BudgetCalculations = () => {
  const [maintenanceBudget, setMaintenanceBudget] = useState({
    monthlyBudget: 50000,
    actualSpent: 35000,
    pendingApprovals: 12000,
    budgetUtilization: 70
  });

  const [unitCosts, setUnitCosts] = useState([
    { id: 1, asset: 'HVAC Unit A1', unit: 'per hour', cost: 125.50, usage: 120, total: 15060 },
    { id: 2, asset: 'Water Pump P-101', unit: 'per repair', cost: 850.00, usage: 3, total: 2550 },
    { id: 3, asset: 'Conveyor Belt CB-1', unit: 'per maintenance', cost: 200.00, usage: 4, total: 800 },
    { id: 4, asset: 'Air Compressor AC-2', unit: 'per oil change', cost: 120.00, usage: 2, total: 240 },
    { id: 5, asset: 'Cafeteria Lighting', unit: 'per fixture', cost: 42.00, usage: 12, total: 504 }
  ]);

  const [newUnitCost, setNewUnitCost] = useState({
    asset: '',
    unit: '',
    cost: '',
    usage: ''
  });

  const budgetData = [
    { name: 'Jan', budget: 50000, spent: 45000 },
    { name: 'Feb', budget: 50000, spent: 48000 },
    { name: 'Mar', budget: 50000, spent: 52000 },
    { name: 'Apr', budget: 50000, spent: 47000 },
    { name: 'May', budget: 50000, spent: 49000 },
    { name: 'Jun', budget: 50000, spent: 35000 }
  ];

  const unitCostDistribution = unitCosts.map(item => ({
    name: item.asset,
    value: item.total
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleAddUnitCost = () => {
    if (newUnitCost.asset && newUnitCost.unit && newUnitCost.cost && newUnitCost.usage) {
      const newItem = {
        id: unitCosts.length + 1,
        asset: newUnitCost.asset,
        unit: newUnitCost.unit,
        cost: parseFloat(newUnitCost.cost),
        usage: parseInt(newUnitCost.usage),
        total: parseFloat(newUnitCost.cost) * parseInt(newUnitCost.usage)
      };
      
      setUnitCosts([...unitCosts, newItem]);
      setNewUnitCost({ asset: '', unit: '', cost: '', usage: '' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUnitCost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Budget Calculations" 
        subtitle="Manage maintenance budgets and calculate unit costs"
      />
      
      <div className="p-8">
        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Monthly Budget</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">LKR {maintenanceBudget.monthlyBudget.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Actual Spent</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">LKR {maintenanceBudget.actualSpent.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">LKR {maintenanceBudget.pendingApprovals.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Budget Utilization</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{maintenanceBudget.budgetUtilization}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Budget Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Budget vs Actual Spending</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Amount']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="budget" name="Budget" fill="#3B82F6" />
                  <Bar dataKey="spent" name="Actual Spent" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Maintenance Budget Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Maintenance Monthly Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="monthlyBudget">Monthly Budget (LKR)</Label>
                  <Input
                    id="monthlyBudget"
                    type="number"
                    value={maintenanceBudget.monthlyBudget}
                    onChange={(e) => setMaintenanceBudget(prev => ({
                      ...prev,
                      monthlyBudget: parseFloat(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="actualSpent">Actual Spent (LKR)</Label>
                  <Input
                    id="actualSpent"
                    type="number"
                    value={maintenanceBudget.actualSpent}
                    onChange={(e) => setMaintenanceBudget(prev => ({
                      ...prev,
                      actualSpent: parseFloat(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="pendingApprovals">Pending Approvals (LKR)</Label>
                  <Input
                    id="pendingApprovals"
                    type="number"
                    value={maintenanceBudget.pendingApprovals}
                    onChange={(e) => setMaintenanceBudget(prev => ({
                      ...prev,
                      pendingApprovals: parseFloat(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                </div>
                
                <div className="pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget Utilization</span>
                    <span className="font-medium">{maintenanceBudget.budgetUtilization}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${maintenanceBudget.budgetUtilization}%` }}
                    ></div>
                  </div>
                </div>
                
                <Button className="w-full mt-4">Save Budget Settings</Button>
              </div>
            </CardContent>
          </Card>

          {/* Per Unit Cost Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Per Unit Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="asset">Asset</Label>
                    <Input
                      id="asset"
                      name="asset"
                      value={newUnitCost.asset}
                      onChange={handleInputChange}
                      placeholder="Asset name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      name="unit"
                      value={newUnitCost.unit}
                      onChange={handleInputChange}
                      placeholder="e.g., per hour"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost">Cost per Unit (LKR)</Label>
                    <Input
                      id="cost"
                      name="cost"
                      type="number"
                      value={newUnitCost.cost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="usage">Usage</Label>
                    <Input
                      id="usage"
                      name="usage"
                      type="number"
                      value={newUnitCost.usage}
                      onChange={handleInputChange}
                      placeholder="Quantity"
                    />
                  </div>
                </div>
                
                <Button onClick={handleAddUnitCost} className="w-full">
                  <Calculator className="w-4 h-4 mr-2" />
                  Add Unit Cost
                </Button>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-slate-900 mb-3">Unit Cost Breakdown</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {unitCosts.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{item.asset}</p>
                        <p className="text-sm text-slate-600">{item.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">LKR {item.cost.toFixed(2)} × {item.usage}</p>
                        <p className="text-sm text-slate-600">Total: LKR {item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unit Cost Distribution Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Unit Cost Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={unitCostDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {unitCostDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Cost']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BudgetCalculations;