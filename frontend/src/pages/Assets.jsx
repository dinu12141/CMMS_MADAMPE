import React, { useState, useEffect } from 'react';
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
  Calendar,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { assetsApi } from '../services/api';
import AssetDetailModal from '../components/AssetDetailModal';
import AssetHistoryModal from '../components/AssetHistoryModal';
import AssetFormModal from '../components/AssetFormModal';

const Assets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [criticalityFilter, setCriticalityFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [assetHistory, setAssetHistory] = useState(null);
  
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Load assets on component mount
  useEffect(() => {
    loadAssets();
  }, []);

  // Apply filters when assets or filter values change
  useEffect(() => {
    applyFilters();
  }, [assets, searchTerm, categoryFilter, statusFilter, criticalityFilter, locationFilter]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the API
      // const data = await assetsApi.getAll();
      // For now, we'll use mock data
      const data = [
        {
          id: 'ASSET-001',
          assetNumber: 'ASSET-001',
          name: 'HVAC Unit A1',
          category: 'HVAC',
          manufacturer: 'Carrier',
          model: 'AquaEdge 19DV',
          serialNumber: 'HV-2020-1234',
          purchaseDate: '2020-03-15',
          installDate: '2020-04-01',
          warrantyExpiry: '2025-04-01',
          location: 'Building A - Floor 3',
          status: 'operational',
          condition: 'good',
          maintenanceCost: 3200,
          downtime: 12,
          lastMaintenance: '2024-12-15',
          nextMaintenance: '2025-01-20',
          criticality: 'high',
          specifications: { capacity: '50 tons', power: '208V 3-Phase' }
        },
        {
          id: 'ASSET-005',
          assetNumber: 'ASSET-005',
          name: 'Water Pump P-101',
          category: 'Pumps',
          manufacturer: 'Grundfos',
          model: 'CR 64-1',
          serialNumber: 'WP-2019-5678',
          purchaseDate: '2019-06-20',
          installDate: '2019-07-05',
          warrantyExpiry: '2024-07-05',
          location: 'Building B - Basement',
          status: 'maintenance',
          condition: 'fair',
          maintenanceCost: 1850,
          downtime: 48,
          lastMaintenance: '2024-11-10',
          nextMaintenance: '2025-02-10',
          criticality: 'critical',
          specifications: { flow: '100 GPM', head: '200 ft' }
        },
        {
          id: 'ASSET-012',
          assetNumber: 'ASSET-012',
          name: 'Conveyor Belt CB-1',
          category: 'Material Handling',
          manufacturer: 'Dorner',
          model: '2200 Series',
          serialNumber: 'CB-2021-9012',
          purchaseDate: '2021-02-10',
          installDate: '2021-03-15',
          warrantyExpiry: '2026-03-15',
          location: 'Warehouse - Section C',
          status: 'operational',
          condition: 'excellent',
          maintenanceCost: 950,
          downtime: 6,
          lastMaintenance: '2025-01-14',
          nextMaintenance: '2025-04-14',
          criticality: 'medium',
          specifications: { length: '50 ft', speed: '100 fpm' }
        },
        {
          id: 'ASSET-008',
          assetNumber: 'ASSET-008',
          name: 'Air Compressor AC-2',
          category: 'Compressed Air',
          manufacturer: 'Atlas Copco',
          model: 'GA 37',
          serialNumber: 'AC-2018-3456',
          purchaseDate: '2018-09-01',
          installDate: '2018-10-15',
          warrantyExpiry: '2023-10-15',
          location: 'Building C - Mechanical Room',
          status: 'operational',
          condition: 'good',
          maintenanceCost: 2100,
          downtime: 18,
          lastMaintenance: '2024-10-22',
          nextMaintenance: '2025-01-22',
          criticality: 'high',
          specifications: { capacity: '37 kW', pressure: '125 PSI' }
        },
        {
          id: 'ASSET-020',
          assetNumber: 'ASSET-020',
          name: 'Cafeteria Lighting',
          category: 'Electrical',
          manufacturer: 'Philips',
          model: 'LED Panel 600x600',
          serialNumber: 'LT-2022-7890',
          purchaseDate: '2022-05-10',
          installDate: '2022-06-01',
          warrantyExpiry: '2027-06-01',
          location: 'Building A - Cafeteria',
          status: 'degraded',
          condition: 'fair',
          maintenanceCost: 450,
          downtime: 0,
          lastMaintenance: '2024-06-01',
          nextMaintenance: '2025-06-01',
          criticality: 'low',
          specifications: { wattage: '48W', lumens: '4800 lm' }
        }
      ];
      setAssets(data);
    } catch (err) {
      setError('Failed to load assets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = assets;
    
    // Search term filter
    if (searchTerm) {
      result = result.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(asset => asset.category === categoryFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(asset => asset.status === statusFilter);
    }
    
    // Criticality filter
    if (criticalityFilter !== 'all') {
      result = result.filter(asset => asset.criticality === criticalityFilter);
    }
    
    // Location filter
    if (locationFilter !== 'all') {
      result = result.filter(asset => asset.location === locationFilter);
    }
    
    setFilteredAssets(result);
  };

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

  // Get unique values for filters
  const categories = ['all', ...new Set(assets.map(a => a.category))];
  const statuses = ['all', ...new Set(assets.map(a => a.status))];
  const criticalities = ['all', ...new Set(assets.map(a => a.criticality))];
  const locations = ['all', ...new Set(assets.map(a => a.location))];

  const handleViewDetails = (asset) => {
    setSelectedAsset(asset);
    setShowDetailModal(true);
  };

  const handleViewHistory = async (asset) => {
    setSelectedAsset(asset);
    try {
      // In a real app, this would fetch from the API
      // const history = await assetsApi.getHistory(asset.id);
      // For now, we'll use mock data
      const mockHistory = {
        workOrders: [
          {
            id: 'WO-001',
            workOrderNumber: 'WO-001',
            title: 'Replace HVAC Filter - Building A',
            description: 'Monthly filter replacement for main HVAC unit',
            priority: 'high',
            status: 'completed',
            assignedTo: 'John Smith',
            dueDate: '2025-01-20T17:00:00Z',
            estimatedTime: 2,
            cost: 150
          }
        ],
        preventiveMaintenance: [
          {
            id: 'PM-001',
            pmNumber: 'PM-001',
            name: 'HVAC Filter Replacement',
            frequency: 'monthly',
            nextDue: '2025-02-20',
            estimatedDuration: 2,
            assignedTo: 'John Smith',
            active: true,
            tasks: ['Remove old filter', 'Inspect housing', 'Install new filter', 'Test airflow']
          }
        ],
        serviceRequests: []
      };
      setAssetHistory(mockHistory);
      setShowHistoryModal(true);
    } catch (err) {
      console.error('Failed to load asset history', err);
    }
  };

  const handleAddAsset = () => {
    setSelectedAsset(null);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEditAsset = (asset) => {
    setSelectedAsset(asset);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleSaveAsset = async (assetData) => {
    try {
      if (isEditing) {
        // In a real app, this would update via the API
        // await assetsApi.update(selectedAsset.id, assetData);
        // For now, we'll just update locally
        setAssets(assets.map(asset => 
          asset.id === selectedAsset.id ? {...asset, ...assetData} : asset
        ));
      } else {
        // In a real app, this would create via the API
        // const newAsset = await assetsApi.create(assetData);
        // For now, we'll just add locally
        const newAsset = {
          id: `ASSET-${assets.length + 1}`,
          assetNumber: `ASSET-${assets.length + 1}`,
          ...assetData
        };
        setAssets([...assets, newAsset]);
      }
      setShowFormModal(false);
    } catch (err) {
      console.error('Failed to save asset', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-slate-400 mx-auto animate-spin" />
          <p className="mt-2 text-slate-500">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-2 text-red-500">{error}</p>
          <Button className="mt-4" onClick={loadAssets}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Assets & Equipment" 
        subtitle="Track and manage all facility assets and equipment"
      />
      
      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" onClick={handleAddAsset}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>

        {/* Advanced Filters */}
        {advancedFiltersOpen && (
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category === 'all' ? 'All Categories' : category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Criticality</label>
                <select
                  value={criticalityFilter}
                  onChange={(e) => setCriticalityFilter(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {criticalities.map(criticality => (
                    <option key={criticality} value={criticality}>{criticality === 'all' ? 'All Criticalities' : criticality.charAt(0).toUpperCase() + criticality.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location === 'all' ? 'All Locations' : location}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setCriticalityFilter('all');
                    setLocationFilter('all');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.slice(1).map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? 'default' : 'outline'}
              onClick={() => setCategoryFilter(categoryFilter === category ? 'all' : category)}
              className="capitalize whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Showing {filteredAssets.length} of {assets.length} assets
          </p>
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
                      <p className="text-xs text-slate-500 font-mono">{asset.assetNumber}</p>
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
                    <p className="text-sm font-bold text-slate-900">LKR {asset.maintenanceCost?.toLocaleString()}</p>
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
                      {asset.nextMaintenance ? new Date(asset.nextMaintenance).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewHistory(asset)}
                  >
                    View History
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleViewDetails(asset)}
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No assets found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('all');
                setCriticalityFilter('all');
                setLocationFilter('all');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AssetDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        asset={selectedAsset}
      />
      
      <AssetHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        asset={selectedAsset}
        historyData={assetHistory}
      />
      
      <AssetFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSaveAsset}
        asset={selectedAsset}
        isEditing={isEditing}
      />
    </div>
  );
};

export default Assets;