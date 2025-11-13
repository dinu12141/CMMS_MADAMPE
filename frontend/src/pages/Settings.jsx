import React, { useState } from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  User,
  Users,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Workflow
} from 'lucide-react';
import { users } from '../mockData';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('users');

  const roles = ['Admin', 'Manager', 'Technician', 'Viewer'];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Settings" 
        subtitle="Manage system settings, users, and configurations"
      />
      
      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 border border-slate-200">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users & Roles
            </TabsTrigger>
            <TabsTrigger value="workflow" className="gap-2">
              <Workflow className="w-4 h-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Users & Roles Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">User Management</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <User className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-slate-900">{user.name}</h3>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">{user.email}</p>
                        <p className="text-sm text-slate-600 mb-3">{user.phone}</p>
                        
                        <div className="flex gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Active WOs</p>
                            <p className="font-bold text-slate-900">{user.activeWOs}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Completed</p>
                            <p className="font-bold text-slate-900">{user.completedWOs}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                      <Button variant="outline" size="sm">Deactivate</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Roles Section */}
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roles.map((role) => (
                    <div key={role} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-900">{role}</p>
                          <p className="text-sm text-slate-600">
                            {role === 'Admin' && 'Full system access and control'}
                            {role === 'Manager' && 'Manage work orders and view reports'}
                            {role === 'Technician' && 'Create and complete work orders'}
                            {role === 'Viewer' && 'Read-only access to reports'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-1">Auto-generate PM Work Orders</h4>
                        <p className="text-sm text-slate-600">Automatically create work orders 7 days before PM due date</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit Rule</Button>
                      <Button variant="outline" size="sm">Disable</Button>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-1">Low Stock Alerts</h4>
                        <p className="text-sm text-slate-600">Send notification when inventory reaches minimum threshold</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit Rule</Button>
                      <Button variant="outline" size="sm">Disable</Button>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-1">Overdue Work Order Escalation</h4>
                        <p className="text-sm text-slate-600">Notify manager when work order is 2 days overdue</p>
                      </div>
                      <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit Rule</Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Enable</Button>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4" variant="outline">
                  <Workflow className="w-4 h-4 mr-2" />
                  Create New Rule
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Work Order Assignments</p>
                      <p className="text-sm text-slate-600">Get notified when assigned to a work order</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Overdue Tasks</p>
                      <p className="text-sm text-slate-600">Daily digest of overdue work orders</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Inventory Alerts</p>
                      <p className="text-sm text-slate-600">Low stock and reorder notifications</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Preventive Maintenance Reminders</p>
                      <p className="text-sm text-slate-600">Reminders 3 days before PM is due</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="Acme Manufacturing Inc." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="America/New_York (EST)" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" defaultValue="USD ($)" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Input id="date-format" defaultValue="MM/DD/YYYY" />
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data & Backup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Last Backup</p>
                    <p className="text-sm text-slate-600">January 18, 2025 at 3:00 AM</p>
                  </div>
                  <Button variant="outline" size="sm">Backup Now</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Export Data</p>
                    <p className="text-sm text-slate-600">Download all system data as CSV</p>
                  </div>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
