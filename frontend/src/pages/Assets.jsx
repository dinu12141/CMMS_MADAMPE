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
import { assetsApi, locationsApi } from '../services/api';
import AssetDetailModal from '../components/AssetDetailModal';
import AssetHistoryModal from '../components/AssetHistoryModal';
import AssetFormModal from '../components/AssetFormModal';
import { useNotification } from '../hooks/useNotification';

const Assets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [criticalityFilter, setCriticalityFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  
  const [assets, setAssets] = useState([]);
  const [locations, setLocations] = useState([]);
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

  // Load assets and locations on component mount
  useEffect(() => {
    loadAssets();
    loadLocations();
  }, []);

  // Apply filters when assets or filter values change
  useEffect(() => {
    applyFilters();
  }, [assets, searchTerm, statusFilter, criticalityFilter, locationFilter]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      // Fetch assets from the API
      const data = await assetsApi.getAll();
      // Ensure each asset has an id property (handle both id and _id)
      const assetsWithId = data.map(asset => ({
        ...asset,
        id: asset.id || asset._id
      }));
      setAssets(assetsWithId);
      
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

  // Load locations from API
  const loadLocations = async () => {
    try {
      const data = await locationsApi.getAll();
      setLocations(data);
    } catch (err) {
      console.error('Failed to load locations', err);
      showError('Load Error', 'Failed to load locations. Please try again.');
    }
  };

  // Function to get location name by ID
  const getLocationName = (locationId) => {
    if (!locationId) return 'Unknown Location';
    
    // Find location by ID
    const location = locations.find(loc => (loc._id || loc.id) === locationId);
    return location ? location.name : 'Unknown Location';
  };

  const getLocationIdByName = (locationName) => {
    if (!locationName || locationName === 'all') return 'all';
    
    // Find location by name
    const location = locations.find(loc => loc.name === locationName);
    return location ? (location._id || location.id) : null;
  };

  const applyFilters = () => {
    let result = assets;
    
    // Search term filter
    if (searchTerm) {
      result = result.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.assetNumber && asset.assetNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.manufacturer && asset.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.model && asset.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
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
  const statuses = ['all', ...new Set(assets.map(a => a.status).filter(Boolean))];
  const criticalities = ['all', ...new Set(assets.map(a => a.criticality).filter(Boolean))];
  const locationNames = ['all', ...new Set(locations.map(loc => loc.name))];

  const handleViewDetails = (asset) => {
    setSelectedAsset(asset);
    setShowDetailModal(true);
  };

  const handleViewHistory = async (asset) => {
    setSelectedAsset(asset);
    try {
      const history = await assetsApi.getHistory(asset.id);
      setAssetHistory(history);
      setShowHistoryModal(true);
    } catch (err) {
      showError('Load Error', 'Failed to load asset history. Please try again.');
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
        // Update existing asset via API
        const updatedAsset = await assetsApi.update(selectedAsset.id, assetData);
        // Ensure the updated asset has an id property
        const assetWithId = {
          ...updatedAsset,
          id: updatedAsset.id || updatedAsset._id
        };
        setAssets(assets.map(asset => 
          asset.id === selectedAsset.id ? assetWithId : asset
        ));
        showSuccess('Asset Updated', `Asset ${assetData.name} has been successfully updated`);
        
        // Refresh locations data to update asset counts
        loadLocations();
      } else {
        // Create new asset via API
        const newAsset = await assetsApi.create(assetData);
        // Ensure the new asset has an id property
        const assetWithId = {
          ...newAsset,
          id: newAsset.id || newAsset._id
        };
        setAssets([...assets, assetWithId]);
        showSuccess('Asset Created', `New asset ${assetData.name} has been successfully created`);
        
        // Refresh locations data to update asset counts
        loadLocations();
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                  <option key="all" value="all">All Locations</option>
                  {locations.map(location => (
                    <option key={location._id || location.id} value={location._id || location.id}>
                      {location.name}
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
                    {/* Asset Image Preview */}
                    {asset.imageUrl && (
                      <div className="w-16 h-16 flex-shrink-0">
                        <img 
                          src={`http://localhost:8000${asset.imageUrl}`} 
                          alt={asset.name} 
                          className="w-full h-full object-contain rounded border"
                        />
                      </div>
                    )}
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
                    <p className="text-xs font-medium text-slate-900">{getLocationName(asset.location)}</p>
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
        locations={locations} // Pass locations to the form modal
      />
    </div>
  );
};

export default Assets;