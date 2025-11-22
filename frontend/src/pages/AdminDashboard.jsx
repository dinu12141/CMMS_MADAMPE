import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  Settings, 
  Database, 
  Shield, 
  Activity, 
  BarChart3, 
  Bell, 
  HardDrive,
  UserCog,
  Key,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ClipboardList,
  Package,
  Box
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([
    { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'Admin', status: 'Active', lastLogin: '2025-01-20' },
    { id: 2, name: 'John Smith', email: 'john.smith@company.com', role: 'Technician', status: 'Active', lastLogin: '2025-01-19' },
    { id: 3, name: 'Mike Chen', email: 'mike.chen@company.com', role: 'Senior Technician', status: 'Active', lastLogin: '2025-01-20' },
    { id: 4, name: 'Tom Wilson', email: 'tom.wilson@company.com', role: 'Technician', status: 'Inactive', lastLogin: '2025-01-15' },
  ]);
  
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const systemStats = [
    { title: 'Total Users', value: '24', change: '+3%', icon: Users, color: 'bg-blue-500' },
    { title: 'Active Sessions', value: '18', change: '+2', icon: Activity, color: 'bg-green-500' },
    { title: 'System Health', value: '98%', change: 'Good', icon: HardDrive, color: 'bg-purple-500' },
    { title: 'Pending Requests', value: '5', change: '-2', icon: Bell, color: 'bg-orange-500' },
  ];

  const userActivityData = [
    { day: 'Mon', users: 12 },
    { day: 'Tue', users: 15 },
    { day: 'Wed', users: 18 },
    { day: 'Thu', users: 14 },
    { day: 'Fri', users: 16 },
    { day: 'Sat', users: 8 },
    { day: 'Sun', users: 6 },
  ];

  const roleDistributionData = [
    { name: 'Admin', value: 2 },
    { name: 'Manager', value: 3 },
    { name: 'Technician', value: 12 },
    { name: 'Senior Technician', value: 5 },
    { name: 'Viewer', value: 2 },
  ];

  const roleColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'system', label: 'System Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'audit', label: 'Audit Logs', icon: Database },
  ];

  const handleAddUser = () => {
    // In a real app, this would open a modal to add a new user
    console.log('Add user functionality');
    alert('Add user functionality would open here');
  };

  const handleEditUser = (userId) => {
    // In a real app, this would open a modal to edit the user
    console.log('Edit user:', userId);
    alert(`Edit user functionality for user ID: ${userId} would open here`);
  };

  const handleDeleteUser = (userId) => {
    // In a real app, this would delete the user after confirmation
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (confirmed) {
      setUsers(users.filter(user => user.id !== userId));
      console.log('Delete user:', userId);
    }
  };

  const handleViewUser = (userId) => {
    // In a real app, this would show user details
    console.log('View user:', userId);
    alert(`View user details for user ID: ${userId} would open here`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage all system settings and user accounts</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Activity</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Role Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Role Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {roleDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={roleColors[index % roleColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Users']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: 'Sarah Johnson', action: 'Updated system settings', time: '2 minutes ago' },
                    { user: 'John Smith', action: 'Created new work order', time: '15 minutes ago' },
                    { user: 'Mike Chen', action: 'Completed preventive maintenance', time: '1 hour ago' },
                    { user: 'System', action: 'Backup completed successfully', time: '2 hours ago' },
                    { user: 'Tom Wilson', action: 'Updated asset information', time: '3 hours ago' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserCog className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{activity.user}</p>
                          <p className="text-sm text-slate-600">{activity.action}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Management Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button onClick={handleAddUser}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">User</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Role</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Status</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Last Login</th>
                        <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                <p className="text-sm text-slate-600">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="secondary">{user.role}</Badge>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-600">
                            {user.lastLogin}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewUser(user.id)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEditUser(user.id)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No users found matching your search criteria
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'Work Orders', description: 'Create, edit, and manage work orders', icon: ClipboardList },
                    { title: 'Assets', description: 'Manage asset information and maintenance records', icon: Package },
                    { title: 'Inventory', description: 'Track and manage inventory items', icon: Box },
                    { title: 'Analytics', description: 'View and generate reports', icon: BarChart3 },
                    { title: 'Settings', description: 'Modify system configuration', icon: Settings },
                    { title: 'User Management', description: 'Add, edit, and remove users', icon: Users },
                  ].map((permission, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <permission.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{permission.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">System Name</h3>
                      <p className="text-sm text-slate-600">CMMS MADAMPE MILLS</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Timezone</h3>
                      <p className="text-sm text-slate-600">Asia/Colombo (GMT+5:30)</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Language</h3>
                      <p className="text-sm text-slate-600">English</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="font-medium text-slate-900">Maintenance Mode</h3>
                      <p className="text-sm text-slate-600">System is currently active</p>
                    </div>
                    <Button variant="outline" size="sm">Toggle</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Email Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Email Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">SMTP Server</h3>
                      <p className="text-sm text-slate-600">smtp.company.com</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Port</h3>
                      <p className="text-sm text-slate-600">587</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Authentication</h3>
                      <p className="text-sm text-slate-600">Enabled</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="font-medium text-slate-900">Test Email</h3>
                      <p className="text-sm text-slate-600">Send test email to verify settings</p>
                    </div>
                    <Button variant="outline" size="sm">Test</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Backup Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Backup Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Auto Backup</h3>
                      <p className="text-sm text-slate-600">Daily at 2:00 AM</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Backup Location</h3>
                      <p className="text-sm text-slate-600">/backups/cmms</p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Retention Period</h3>
                      <p className="text-sm text-slate-600">30 days</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="font-medium text-slate-900">Manual Backup</h3>
                      <p className="text-sm text-slate-600">Create a backup now</p>
                    </div>
                    <Button>Backup Now</Button>
                  </div>
                </CardContent>
              </Card>

              {/* API Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">API Access</h3>
                      <p className="text-sm text-slate-600">Enabled</p>
                    </div>
                    <Button variant="outline" size="sm">Toggle</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Rate Limiting</h3>
                      <p className="text-sm text-slate-600">1000 requests/hour</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">API Keys</h3>
                      <p className="text-sm text-slate-600">Manage API keys</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="font-medium text-slate-900">Documentation</h3>
                      <p className="text-sm text-slate-600">View API documentation</p>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Authentication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Password Policy</h3>
                      <p className="text-sm text-slate-600">Minimum 8 characters, 1 uppercase, 1 number</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-slate-600">Required for admin users</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Session Timeout</h3>
                      <p className="text-sm text-slate-600">30 minutes of inactivity</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="font-medium text-slate-900">Login Attempts</h3>
                      <p className="text-sm text-slate-600">Lock after 5 failed attempts</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Access Control */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Access Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Role-Based Access</h3>
                      <p className="text-sm text-slate-600">Enabled</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">IP Restrictions</h3>
                      <p className="text-sm text-slate-600">Allow access from specific IP ranges</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-medium text-slate-900">Audit Logging</h3>
                      <p className="text-sm text-slate-600">Log all user activities</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="font-medium text-slate-900">Data Encryption</h3>
                      <p className="text-sm text-slate-600">AES-256 encryption for sensitive data</p>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Security Events */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Security Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { event: 'Failed login attempt', user: 'admin@company.com', ip: '192.168.1.100', time: '2 hours ago', severity: 'medium' },
                      { event: 'Password changed', user: 'sarah.johnson@company.com', ip: '192.168.1.50', time: '5 hours ago', severity: 'low' },
                      { event: 'New API key generated', user: 'system', ip: '192.168.1.1', time: '1 day ago', severity: 'low' },
                      { event: 'Successful admin login', user: 'sarah.johnson@company.com', ip: '192.168.1.50', time: '1 day ago', severity: 'low' },
                      { event: 'Multiple failed login attempts', user: 'unknown', ip: '203.0.113.45', time: '2 days ago', severity: 'high' },
                    ].map((event, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            event.severity === 'high' ? 'bg-red-500' : 
                            event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{event.event}</p>
                            <p className="text-sm text-slate-600">{event.user} • {event.ip}</p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-500">{event.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Audit Logs Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Audit Logs Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Timestamp</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">User</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Action</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Resource</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">IP Address</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[
                        { timestamp: '2025-01-20 14:30:22', user: 'Sarah Johnson', action: 'Updated', resource: 'Work Order WO-001', ip: '192.168.1.50', status: 'Success' },
                        { timestamp: '2025-01-20 14:25:17', user: 'Sarah Johnson', action: 'Created', resource: 'User Profile', ip: '192.168.1.50', status: 'Success' },
                        { timestamp: '2025-01-20 14:10:45', user: 'John Smith', action: 'Viewed', resource: 'Asset ASSET-005', ip: '192.168.1.25', status: 'Success' },
                        { timestamp: '2025-01-20 13:55:33', user: 'Mike Chen', action: 'Completed', resource: 'Work Order WO-002', ip: '192.168.1.30', status: 'Success' },
                        { timestamp: '2025-01-20 13:40:12', user: 'Tom Wilson', action: 'Updated', resource: 'Inventory INV-003', ip: '192.168.1.35', status: 'Success' },
                        { timestamp: '2025-01-20 13:25:08', user: 'Sarah Johnson', action: 'Deleted', resource: 'Document DOC-007', ip: '192.168.1.50', status: 'Success' },
                        { timestamp: '2025-01-20 13:10:44', user: 'System', action: 'Backup', resource: 'Database', ip: '192.168.1.1', status: 'Success' },
                        { timestamp: '2025-01-20 12:55:21', user: 'Sarah Johnson', action: 'Modified', resource: 'System Settings', ip: '192.168.1.50', status: 'Success' },
                      ].map((log, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="py-4 px-6 text-sm text-slate-600">{log.timestamp}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-600">
                                  {log.user.charAt(0)}
                                </span>
                              </div>
                              <span className="text-sm text-slate-900">{log.user}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="secondary">{log.action}</Badge>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-600">{log.resource}</td>
                          <td className="py-4 px-6 text-sm text-slate-600">{log.ip}</td>
                          <td className="py-4 px-6">
                            <Badge className="bg-green-100 text-green-800">Success</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Audit Log Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">1,248</div>
                  <p className="text-sm text-slate-600 mt-1">+12% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">24</div>
                  <p className="text-sm text-slate-600 mt-1">18 currently active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">142</div>
                  <p className="text-sm text-slate-600 mt-1">Automated system actions</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;