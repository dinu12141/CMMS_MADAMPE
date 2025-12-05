import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Plus,
  MapPin,
  Building2,
  Package,
  ClipboardList,
  Map,
  Search,
  Filter
} from 'lucide-react';
import { locationsApi } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import LocationFormModal from '../components/LocationFormModal';
import LocationDetailView from '../components/LocationDetailView';

const Locations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentLocation, setCurrentLocation] = useState(null);

  const { showSuccess, showError } = useNotification();

  // Load locations on component mount
  useEffect(() => {
    loadLocations();
  }, []);

  // Apply filters when locations or filter values change
  useEffect(() => {
    applyFilters();
  }, [locations, searchTerm, typeFilter]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await locationsApi.getAll();
      // Map API response to ensure every location object has a valid id property derived from _id
      const dataWithIds = data.map(loc => ({ ...loc, id: loc.id || loc._id }));
      setLocations(dataWithIds);
    } catch (err) {
      console.error('Failed to load locations', err);
      showError('Load Error', 'Failed to load locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = locations;

    // Search term filter
    if (searchTerm) {
      result = result.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(loc => loc.type === typeFilter);
    }

    setFilteredLocations(result);
  };

  const handleCreateLocation = () => {
    setCurrentLocation(null);
    setModalMode('create');
    setShowFormModal(true);
  };

  const handleEditLocation = (location) => {
    setCurrentLocation(location);
    setModalMode('edit');
    setShowFormModal(true);
  };

  const handleViewDetails = (location) => {
    setCurrentLocation(location);
    setShowDetailModal(true);
  };

  const handleSaveLocation = async (locationData) => {
    try {
      if (modalMode === 'create') {
        // Create new location
        const createdLocation = await locationsApi.create(locationData);
        showSuccess('Location Created', 'New location has been successfully created');
      } else if (modalMode === 'edit') {
        // Update existing location
        const updatedLocation = await locationsApi.update(currentLocation.id, locationData);
        setLocations(locations.map(loc =>
          loc.id === currentLocation.id ? updatedLocation : loc
        ));
        showSuccess('Location Updated', 'Location has been successfully updated');
      }
      // Immediately refresh locations data from backend
      await loadLocations();
      setShowFormModal(false);
      setCurrentLocation(null);
    } catch (err) {
      console.error('Failed to save location', err);
      showError('Save Error', `Failed to save location: ${err.message}`);
    }
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setCurrentLocation(null);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setCurrentLocation(null);
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      await locationsApi.delete(locationId);
      showSuccess('Location Deleted', 'Location has been successfully deleted');
      // Immediately refresh locations data from backend
      await loadLocations();
    } catch (err) {
      console.error('Failed to delete location', err);
      showError('Delete Error', `Failed to delete location: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto animate-spin" />
          <p className="mt-2 text-slate-500">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Locations"
        subtitle="Manage facility locations and their assets"
      />

      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
              />
            </div>
            <Button variant="outline" onClick={() => setTypeFilter('all')}>
              <Filter className="w-4 h-4 mr-2" />
              All Types
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
            >
              <Map className="w-4 h-4 mr-2" />
              Map View
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateLocation}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>

        {/* Type Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'building', 'warehouse', 'facility', 'office'].map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Locations Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <Card key={location.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  {/* Location Image */}
                  {location.imageUrl ? (
                    <div className="mb-4">
                      <img
                        src={`http://localhost:8000${location.imageUrl}`}
                        alt={location.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                      <Building2 className="w-12 h-12 text-slate-400" />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{location.name}</h3>
                        <Badge variant="outline" className="capitalize">
                          {location.type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {location.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-900">{location.address}</p>
                          <p className="text-sm text-slate-600">
                            {location.city}{location.city && ', '}{location.state} {location.zipCode}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-600">Assets</p>
                      <p className="text-xl font-bold text-slate-900">{location.assetCount || 0}</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <ClipboardList className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-600">Active WOs</p>
                      <p className="text-xl font-bold text-slate-900">{location.activeWOs || 0}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(location)}>
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handleEditLocation(location)}>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <Card>
            <CardContent className="p-6">
              <div className="h-[600px] bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Factory Roadmap</h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Interactive map view showing all locations with their details.
                    Click on location markers to view information and manage assets.
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredLocations.slice(0, 3).map((location) => (
                      <Card key={location.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <h4 className="font-medium text-slate-900">{location.name}</h4>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{location.type}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => handleViewDetails(location)}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No locations found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      <LocationFormModal
        isOpen={showFormModal}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveLocation}
        location={currentLocation}
        mode={modalMode}
      />

      <LocationDetailView
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        location={currentLocation}
        onEdit={handleEditLocation}
        onLocationUpdated={(updatedLocation) => {
          // Update the locations list with the new data
          setLocations(locations.map(loc =>
            loc.id === updatedLocation.id ? updatedLocation : loc
          ));
          // Also update the current location
          setCurrentLocation(updatedLocation);
        }}
      />
    </div>
  );
};

export default Locations;