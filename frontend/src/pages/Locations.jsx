import React from 'react';
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
  Map
} from 'lucide-react';
import { locations } from '../mockData';

const Locations = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Locations" 
        subtitle="Manage facility locations and their assets"
      />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline">
            <Map className="w-4 h-4 mr-2" />
            Map View
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card key={location.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
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
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-900">{location.address}</p>
                      <p className="text-sm text-slate-600">{location.city}, {location.state} {location.zipCode}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Size</p>
                    <p className="text-sm font-medium text-slate-900">{location.size.toLocaleString()} sq ft</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Floors</p>
                    <p className="text-sm font-medium text-slate-900">{location.floors}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-600">Assets</p>
                    <p className="text-xl font-bold text-slate-900">{location.assetCount}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <ClipboardList className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-600">Active WOs</p>
                    <p className="text-xl font-bold text-slate-900">{location.activeWOs}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">View Assets</Button>
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map Placeholder */}
        <Card className="mt-6">
          <CardContent className="p-0">
            <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Google Maps Integration</p>
                <p className="text-sm text-slate-500 mt-1">Interactive map view of all locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Locations;
