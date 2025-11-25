import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  MapPin, 
  Building2, 
  Package, 
  ClipboardList, 
  Image, 
  FileText,
  Edit,
  Upload
} from 'lucide-react';

const LocationDetailView = ({ isOpen, onClose, location, onEdit }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>{location?.name || 'Location Details'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Location Info */}
          <div className="md:w-1/2">
            <div className="border-b border-slate-200 mb-4">
              <nav className="flex space-x-4">
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'map'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setActiveTab('map')}
                >
                  Map View
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'assets'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setActiveTab('assets')}
                >
                  Assets
                </button>
              </nav>
            </div>
            
            {activeTab === 'details' && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-slate-900 mb-3">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-600">Address</p>
                          <p className="text-sm font-medium text-slate-900">
                            {location?.address}
                            <br />
                            {location?.city}, {location?.state} {location?.zipCode}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Type</p>
                          <p className="text-sm font-medium text-slate-900 capitalize">
                            {location?.type || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Size</p>
                          <p className="text-sm font-medium text-slate-900">
                            {location?.size?.toLocaleString() || 'N/A'} sq ft
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Floors</p>
                          <p className="text-sm font-medium text-slate-900">
                            {location?.floors || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Coordinates</p>
                          <p className="text-sm font-medium text-slate-900">
                            {location?.coordinates?.lat?.toFixed(4)}, {location?.coordinates?.lng?.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-slate-900 mb-3">Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-600">Assets</p>
                        <p className="text-xl font-bold text-slate-900">
                          {location?.assetCount || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <ClipboardList className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-600">Active WOs</p>
                        <p className="text-xl font-bold text-slate-900">
                          {location?.activeWOs || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-900">Location Image</h3>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                        />
                      </Button>
                    </div>
                    
                    <div className="border-2 border-dashed border-slate-300 rounded-lg h-48 flex items-center justify-center">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Location preview" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">No image uploaded</p>
                          <p className="text-xs text-slate-400 mt-1">Upload an image of this location</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === 'map' && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-slate-900 mb-3">Factory Roadmap</h3>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg h-96 flex items-center justify-center bg-slate-50">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">Interactive Map View</p>
                        <p className="text-sm text-slate-500 mt-1">
                          Google Maps integration would show here
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          Coordinates: {location?.coordinates?.lat?.toFixed(6)}, {location?.coordinates?.lng?.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-slate-900 mb-3">Location Notes</h3>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg h-32 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Add notes about this location</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === 'assets' && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-slate-900 mb-3">Assets at this Location</h3>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg h-96 flex items-center justify-center">
                      <div className="text-center">
                        <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600 font-medium">Assets List</p>
                        <p className="text-sm text-slate-500 mt-1">
                          List of assets at this location would appear here
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          {/* Right Column - Map/Image Preview */}
          <div className="md:w-1/2">
            <Card className="h-full">
              <CardContent className="p-4 h-full">
                <h3 className="font-medium text-slate-900 mb-3">Location Preview</h3>
                <div className="border-2 border-dashed border-slate-300 rounded-lg h-full flex items-center justify-center bg-slate-50">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">Location Preview</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {activeTab === 'map' 
                        ? 'Interactive map view of the factory roadmap' 
                        : 'Image or diagram of the location'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(location)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDetailView;