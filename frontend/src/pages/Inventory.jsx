import React, { useState } from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Plus, 
  Filter,
  Package,
  AlertTriangle,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import { inventory } from '../mockData';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (item) => {
    if (item.status === 'critical') {
      return { color: 'bg-red-100 text-red-700 border-red-300', icon: AlertTriangle, label: 'Critical' };
    } else if (item.status === 'low-stock') {
      return { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: TrendingDown, label: 'Low Stock' };
    } else {
      return { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'In Stock' };
    }
  };

  const statusCounts = {
    all: inventory.length,
    'in-stock': inventory.filter(i => i.status === 'in-stock').length,
    'low-stock': inventory.filter(i => i.status === 'low-stock').length,
    'critical': inventory.filter(i => i.status === 'critical').length
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Inventory Management" 
        subtitle="Track parts, supplies, and stock levels"
      />
      
      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Generate PO</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'in-stock', 'low-stock', 'critical'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status.replace('-', ' ')}
              <Badge variant="secondary" className="ml-2">
                {statusCounts[status]}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item) => {
            const statusInfo = getStatusInfo(item);
            const stockPercentage = (item.quantity / item.maxStock) * 100;
            
            return (
              <Card key={item.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{item.name}</h3>
                        <p className="text-xs text-slate-500 font-mono">{item.partNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Badge className={statusInfo.color + ' border'}>
                      <statusInfo.icon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Stock Level</span>
                        <span className="font-medium text-slate-900">
                          {item.quantity} / {item.maxStock} {item.unit}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            stockPercentage < 30 ? 'bg-red-500' :
                            stockPercentage < 50 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${stockPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500">Min Stock</p>
                        <p className="text-sm font-medium text-slate-900">{item.minStock} {item.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Unit Cost</p>
                        <p className="text-sm font-medium text-slate-900">${item.unitCost}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Category</p>
                        <p className="text-sm font-medium text-slate-900">{item.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Location</p>
                        <p className="text-sm font-medium text-slate-900">{item.location}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Supplier</p>
                      <p className="text-sm font-medium text-slate-900">{item.supplier}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">Details</Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">Reorder</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No inventory items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
