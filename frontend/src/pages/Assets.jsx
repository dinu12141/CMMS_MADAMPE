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
  TrendingUp,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { assets } from '../mockData';

const Assets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...new Set(assets.map(a => a.category))];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-700';
      case 'maintenance': return 'bg-orange-100 text-orange-700';
      case 'degraded': return 'bg-yellow-100 text-yellow-700';
      case 'offline': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCriticalityColor = (criticality) => {
    switch (criticality) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Assets & Equipment" 
        subtitle="Track and manage all facility assets and equipment"
      />
      
      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? 'default' : 'outline'}
              onClick={() => setCategoryFilter(category)}
              className="capitalize whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{asset.name}</h3>
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{asset.manufacturer} - {asset.model}</p>
                      <p className="text-xs text-slate-500 font-mono">{asset.id}</p>
                    </div>
                  </div>
                  <Badge className={getCriticalityColor(asset.criticality)}>
                    {asset.criticality}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Category</p>
                    <p className="text-sm font-medium text-slate-900">{asset.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Location</p>
                    <p className="text-sm font-medium text-slate-900">{asset.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Condition</p>
                    <p className={`text-sm font-medium capitalize ${getConditionColor(asset.condition)}`}>
                      {asset.condition}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Serial Number</p>
                    <p className="text-sm font-medium text-slate-900">{asset.serialNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Maint. Cost</p>
                    <p className="text-sm font-bold text-slate-900">${asset.maintenanceCost.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Downtime</p>
                    <p className="text-sm font-bold text-slate-900">{asset.downtime}h</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Next PM</p>
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(asset.nextMaintenance).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">View History</Button>
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No assets found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assets;
