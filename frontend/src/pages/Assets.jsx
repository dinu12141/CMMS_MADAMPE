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
import { useNotification } from '../hooks/useNotification';

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

  const { showSuccess, showWarning, showError } = useNotification();

  // Updated categories as per user request with "All" at the top
  const categories = [
    'all',
    'VCO Plant',
    'Madampe Plant (DS)',
    'Madampe plant (CS)',
    'Wet Section ( DS)',
    'Pairing Section',
    'Sifter Section',
    'Thambagalla Section',
    'Boiler Section',
    'Generator Section',
    'Way Bridge Section'
  ];

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
      // For now, we'll use mock data with the new categories
      const data = [
        {
          id: 'ASSET-001',
          assetNumber: 'ASSET-001',
          name: 'Centrifuge Unit VC-101',
          category: 'VCO Plant',
          manufacturer: 'Alfa Laval',
          model: 'FX 300',
          serialNumber: 'VC-2020-1234',
          purchaseDate: '2020-03-15',
          installDate: '2020-04-01',
          warrantyExpiry: '2025-04-01',
          location: 'VCO Plant - Processing Area',
          status: 'operational',
          condition: 'good',
          maintenanceCost: 3200,
          downtime: 12,
          lastMaintenance: '2024-12-15',
          nextMaintenance: '2025-01-20',
          criticality: 'high',
          specifications: { capacity: '5000 L/h', power: '22 kW' }
        },
        {
          id: 'ASSET-002',
          assetNumber: 'ASSET-002',
          name: 'Steam Boiler B-201',
          category: 'Boiler Section',
          manufacturer: 'Babcock & Wilcox',
          model: 'ST-500',
          serialNumber: 'BL-2019-5678',
          purchaseDate: '2019-06-20',
          installDate: '2019-07-05',
          warrantyExpiry: '2024-07-05',
          location: 'Boiler Section - Main Hall',
          status: 'maintenance',
          condition: 'fair',
          maintenanceCost: 1850,
          downtime: 48,
          lastMaintenance: '2024-11-10',
          nextMaintenance: '2025-02-10',
          criticality: 'critical',
          specifications: { capacity: '10 tons/h', pressure: '150 PSI' }
        },
        {
          id: 'ASSET-003',
          assetNumber: 'ASSET-003',
          name: 'Conveyor Belt CB-301',
          category: 'Way Bridge Section',
          manufacturer: 'Dorner',
          model: '2200 Series',
          serialNumber: 'CB-2021-9012',
          purchaseDate: '2021-02-10',
          installDate: '2021-03-15',
          warrantyExpiry: '2026-03-15',
          location: 'Way Bridge Section - Transport',
          status: 'operational',
          condition: 'excellent',
          maintenanceCost: 950,
          downtime: 6,
          lastMaintenance: '2025-01-14',
          nextMaintenance: '2025-04-14',
          criticality: 'medium',
          specifications: { length: '30 ft', speed: '80 fpm' }
        },
        {
          id: 'ASSET-004',
          assetNumber: 'ASSET-004',
          name: 'Generator Set G-101',
          category: 'Generator Section',
          manufacturer: 'Caterpillar',
          model: 'CAT 3512',
          serialNumber: 'GN-2018-3456',
          purchaseDate: '2018-09-01',
          installDate: '2018-10-15',
          warrantyExpiry: '2023-10-15',
          location: 'Generator Section - Power House',
          status: 'operational',
          condition: 'good',
          maintenanceCost: 2100,
          downtime: 18,
          lastMaintenance: '2024-10-22',
          nextMaintenance: '2025-01-22',
          criticality: 'high',
          specifications: { capacity: '1500 kW', voltage: '415V' }
        },
        {
          id: 'ASSET-005',
          assetNumber: 'ASSET-005',
          name: 'Sifter Machine S-401',
          category: 'Sifter Section',
          manufacturer: 'Buhler',
          model: 'SF 200',
          serialNumber: 'SF-2022-7890',
          purchaseDate: '2022-05-10',
          installDate: '2022-06-01',
          warrantyExpiry: '2027-06-01',
          location: 'Sifter Section - Processing',
          status: 'degraded',
          condition: 'fair',
          maintenanceCost: 450,
          downtime: 0,
          lastMaintenance: '2024-06-01',
          nextMaintenance: '2025-06-01',
          criticality: 'low',
          specifications: { capacity: '20 tons/h', screens: '4 layers' }
        },
        {
          id: 'ASSET-006',
          assetNumber: 'ASSET-006',
          name: 'Press Machine PM-201',
          category: 'Madampe Plant (DS)',
          manufacturer: 'Anderson',
          model: 'PM 500',
          serialNumber: 'PM-2021-1122',
          purchaseDate: '2021-01-15',
          installDate: '2021-02-01',
          warrantyExpiry: '2026-02-01',
          location: 'Madampe Plant (DS) - Pressing',
          status: 'operational',
          condition: 'good',
          maintenanceCost: 1200,
          downtime: 5,
          lastMaintenance: '2025-01-05',
          nextMaintenance: '2025-04-05',
          criticality: 'high',
          specifications: { capacity: '15 tons/h', pressure: '100 PSI' }
        },
        {
          id: 'ASSET-007',
          assetNumber: 'ASSET-007',
          name: 'Clarifier Unit CU-301',
          category: 'Madampe plant (CS)',
          manufacturer: 'Alfa Laval',
          model: 'CXS 300',
          serialNumber: 'CU-2020-3344',
          purchaseDate: '2020-05-10',
          installDate: '2020-06-01',
          warrantyExpiry: '2025-06-01',
          location: 'Madampe plant (CS) - Clarification',
          status: 'operational',
          condition: 'excellent',
          maintenanceCost: 2100,
          downtime: 3,
          lastMaintenance: '2024-12-20',
          nextMaintenance: '2025-03-20',
          criticality: 'high',
          specifications: { capacity: '8000 L/h', power: '15 kW' }
        },
        {
          id: 'ASSET-008',
          assetNumber: 'ASSET-008',
          name: 'Washing Drum WD-101',
          category: 'Wet Section ( DS)',
          manufacturer: 'Buhler',
          model: 'WD 400',
          serialNumber: 'WD-2019-5566',
          purchaseDate: '2019-08-20',
          installDate: '2019-09-05',
          warrantyExpiry: '2024-09-05',
          location: 'Wet Section ( DS) - Washing',
          status: 'maintenance',
          condition: 'fair',
          maintenanceCost: 850,
          downtime: 15,
          lastMaintenance: '2024-11-25',
          nextMaintenance: '2025-02-25',
          criticality: 'medium',
          specifications: { capacity: '12 tons/h', rotation: '15 rpm' }
        },
        {
          id: 'ASSET-009',
          assetNumber: 'ASSET-009',
          name: 'Pairing Roller PR-201',
          category: 'Pairing Section',
          manufacturer: 'Anderson',
          model: 'PR 600',
          serialNumber: 'PR-2021-7788',
          purchaseDate: '2021-03-10',
          installDate: '2021-04-01',
          warrantyExpiry: '2026-04-01',
          location: 'Pairing Section - Processing',
          status: 'operational',
          condition: 'good',
          maintenanceCost: 650,
          downtime: 2,
          lastMaintenance: '2024-12-30',
          nextMaintenance: '2025-03-30',
          criticality: 'medium',
          specifications: { capacity: '10 tons/h', gap: '0.5-5 mm' }
        },
        {
          id: 'ASSET-010',
          assetNumber: 'ASSET-010',
          name: 'Threshing Unit TU-101',
          category: 'Thambagalla Section',
          manufacturer: 'Cimbria',
          model: 'TU 700',
          serialNumber: 'TU-2020-9900',
          purchaseDate: '2020-07-15',
          installDate: '2020-08-01',
          warrantyExpiry: '2025-08-01',
          location: 'Thambagalla Section - Threshing',
          status: 'operational',
          condition: 'excellent',
          maintenanceCost: 1800,
          downtime: 4,
          lastMaintenance: '2025-01-10',
          nextMaintenance: '2025-04-10',
          criticality: 'high',
          specifications: { capacity: '25 tons/h', power: '30 kW' }
        }
      ];
      setAssets(data);
      
      // Show a notification when assets are loaded
      showSuccess('Assets Loaded', `Successfully loaded ${data.length} assets`);
    } catch (err) {
      setError('Failed to load assets');
      showError('Load Error', 'Failed to load assets. Please try again.');
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

  // Get unique values for other filters
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
            title: 'Replace Filter - Centrifuge Unit',
            description: 'Monthly filter replacement for centrifuge unit',
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
            name: 'Centrifuge Maintenance',
            frequency: 'monthly',
            nextDue: '2025-02-20',
            estimatedDuration: 2,
            assignedTo: 'John Smith',
            active: true,
            tasks: ['Clean filters', 'Check oil levels', 'Inspect belts', 'Test operation']
          }
        ],
        serviceRequests: []
      };
      setAssetHistory(mockHistory);
      setShowHistoryModal(true);
    } catch (err) {
      showError('Load Error', 'Failed to load asset history');
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
        showSuccess('Asset Updated', `Asset ${assetData.name} has been successfully updated`);
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
        showSuccess('Asset Created', `New asset ${assetData.name} has been successfully created`);
      }
      setShowFormModal(false);
    } catch (err) {
      showError('Save Error', 'Failed to save asset. Please try again.');
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
      
      <div className="p-4">
        {/* Actions Bar - Made more compact */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-64 h-9 text-sm"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
              className="flex items-center gap-1 h-9 px-2 text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 h-9 px-3 text-sm" onClick={handleAddAsset}>
            <Plus className="w-4 h-4 mr-1" />
            Add Asset
          </Button>
        </div>

        {/* Advanced Filters - Made smaller */}
        {advancedFiltersOpen && (
          <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Criticality</label>
                <select
                  value={criticalityFilter}
                  onChange={(e) => setCriticalityFilter(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {criticalities.map(criticality => (
                    <option key={criticality} value={criticality}>
                      {criticality === 'all' ? 'All Criticalities' : criticality.charAt(0).toUpperCase() + criticality.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location === 'all' ? 'All Locations' : location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-2">
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => {
                  setCategoryFilter('all');
                  setStatusFilter('all');
                  setCriticalityFilter('all');
                  setLocationFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Category Filter Chips - Only showing "All" */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            key="all"
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('all')}
            className="whitespace-nowrap h-8 text-sm px-3"
          >
            All
          </Button>
        </div>

        {/* Results Summary */}
        <div className="mb-3">
          <p className="text-xs text-slate-600">
            Showing {filteredAssets.length} of {assets.length} assets
          </p>
        </div>

        {/* Assets Grid - Made more compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-900">{asset.name}</h3>
                        <Badge className={`${getStatusColor(asset.status)} text-xs px-1.5 py-0.5`}>
                          {asset.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mb-1">{asset.manufacturer} - {asset.model}</p>
                      <p className="text-xs text-slate-500 font-mono">{asset.assetNumber}</p>
                    </div>
                  </div>
                  <Badge className={`${getCriticalityColor(asset.criticality)} text-xs px-1.5 py-0.5`}>
                    {asset.criticality}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Category</p>
                    <p className="text-xs font-medium text-slate-900">{asset.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Location</p>
                    <p className="text-xs font-medium text-slate-900">{asset.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Condition</p>
                    <p className={`text-xs font-medium capitalize ${getConditionColor(asset.condition)}`}>
                      {asset.condition}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Serial Number</p>
                    <p className="text-xs font-medium text-slate-900">{asset.serialNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <TrendingUp className="w-4 h-4 text-slate-400 mx-auto mb-0.5" />
                    <p className="text-xs text-slate-500">Maint. Cost</p>
                    <p className="text-xs font-bold text-slate-900">LKR {asset.maintenanceCost?.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <AlertTriangle className="w-4 h-4 text-slate-400 mx-auto mb-0.5" />
                    <p className="text-xs text-slate-500">Downtime</p>
                    <p className="text-xs font-bold text-slate-900">{asset.downtime}h</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <Calendar className="w-4 h-4 text-slate-400 mx-auto mb-0.5" />
                    <p className="text-xs text-slate-500">Next PM</p>
                    <p className="text-xs font-bold text-slate-900">
                      {asset.nextMaintenance ? new Date(asset.nextMaintenance).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-8 text-xs px-2"
                    onClick={() => handleViewHistory(asset)}
                  >
                    View History
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 h-8 text-xs px-2"
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
          <div className="text-center py-8">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No assets found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-3 h-8 text-xs"
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