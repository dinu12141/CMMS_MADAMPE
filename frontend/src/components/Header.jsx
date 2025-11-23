import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Package, Wrench, MapPin, User } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { workOrders, assets, inventory, preventiveMaintenance, serviceRequests, locations, users, documents } from '../mockData';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

const Header = ({ title, subtitle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (term.length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const termLower = term.toLowerCase();
    
    // Search across all data sources
    const workOrderMatches = workOrders
      .filter(wo => 
        wo.title.toLowerCase().includes(termLower) ||
        wo.id.toLowerCase().includes(termLower) ||
        wo.description.toLowerCase().includes(termLower) ||
        wo.assetName.toLowerCase().includes(termLower)
      )
      .slice(0, 3)
      .map(wo => ({
        id: wo.id,
        title: wo.title,
        subtitle: `Work Order • ${wo.assetName}`,
        type: 'workorder',
        icon: Wrench,
        path: `/work-orders`
      }));

    const assetMatches = assets
      .filter(asset => 
        asset.name.toLowerCase().includes(termLower) ||
        asset.id.toLowerCase().includes(termLower) ||
        asset.category.toLowerCase().includes(termLower) ||
        asset.manufacturer.toLowerCase().includes(termLower)
      )
      .slice(0, 3)
      .map(asset => ({
        id: asset.id,
        title: asset.name,
        subtitle: `Asset • ${asset.category}`,
        type: 'asset',
        icon: Package,
        path: `/assets`
      }));

    const inventoryMatches = inventory
      .filter(item => 
        item.name.toLowerCase().includes(termLower) ||
        item.partNumber.toLowerCase().includes(termLower) ||
        item.id.toLowerCase().includes(termLower) ||
        item.category.toLowerCase().includes(termLower)
      )
      .slice(0, 3)
      .map(item => ({
        id: item.id,
        title: item.name,
        subtitle: `Inventory • ${item.category}`,
        type: 'inventory',
        icon: Package,
        path: `/inventory`
      }));

    const pmMatches = preventiveMaintenance
      .filter(pm => 
        pm.name.toLowerCase().includes(termLower) ||
        pm.id.toLowerCase().includes(termLower) ||
        pm.assetName.toLowerCase().includes(termLower)
      )
      .slice(0, 3)
      .map(pm => ({
        id: pm.id,
        title: pm.name,
        subtitle: `Preventive Maintenance • ${pm.assetName}`,
        type: 'pm',
        icon: Wrench,
        path: `/preventive-maintenance`
      }));

    const serviceRequestMatches = serviceRequests
      .filter(sr => 
        sr.title.toLowerCase().includes(termLower) ||
        sr.id.toLowerCase().includes(termLower) ||
        sr.description.toLowerCase().includes(termLower) ||
        sr.category.toLowerCase().includes(termLower)
      )
      .slice(0, 3)
      .map(sr => ({
        id: sr.id,
        title: sr.title,
        subtitle: `Service Request • ${sr.category}`,
        type: 'servicerequest',
        icon: Wrench,
        path: `/requests`
      }));

    const documentMatches = documents
      .filter(doc => 
        doc.name.toLowerCase().includes(termLower) ||
        doc.id.toLowerCase().includes(termLower) ||
        doc.description.toLowerCase().includes(termLower)
      )
      .slice(0, 3)
      .map(doc => ({
        id: doc.id,
        title: doc.name,
        subtitle: `Document • ${doc.category}`,
        type: 'document',
        icon: FileText,
        path: `/documents`
      }));

    const locationMatches = locations
      .filter(loc => 
        loc.name.toLowerCase().includes(termLower) ||
        loc.id.toLowerCase().includes(termLower)
      )
      .slice(0, 3)
      .map(loc => ({
        id: loc.id,
        title: loc.name,
        subtitle: `Location • ${loc.type}`,
        type: 'location',
        icon: MapPin,
        path: `/locations`
      }));

    const userMatches = users
      .filter(user => 
        user.name.toLowerCase().includes(termLower) ||
        user.id.toLowerCase().includes(termLower) ||
        user.email.toLowerCase().includes(termLower) ||
        user.role.toLowerCase().includes(termLower)
      )
      .slice(0, 3)
      .map(user => ({
        id: user.id,
        title: user.name,
        subtitle: `User • ${user.role}`,
        type: 'user',
        icon: User,
        path: `/settings`
      }));

    // Combine all results
    const allResults = [
      ...workOrderMatches,
      ...assetMatches,
      ...inventoryMatches,
      ...pmMatches,
      ...serviceRequestMatches,
      ...documentMatches,
      ...locationMatches,
      ...userMatches
    ].slice(0, 10); // Limit to 10 results

    setSearchResults(allResults);
    setShowResults(true);
  };

  // Handle result selection
  const handleResultSelect = (result) => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    
    // Navigate to the appropriate page
    if (result.path) {
      navigate(result.path);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleResultSelect(searchResults[0]);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchTerm.length > 0 && setShowResults(true)}
              onKeyDown={handleKeyPress}
              className="pl-10 w-80"
            />
            
            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="py-1">
                  {searchResults.map((result, index) => {
                    const IconComponent = result.icon;
                    return (
                      <div
                        key={`${result.type}-${result.id}`}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3 border-b border-slate-100 last:border-b-0"
                        onClick={() => handleResultSelect(result)}
                      >
                        <IconComponent className="w-5 h-5 text-slate-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{result.title}</p>
                          <p className="text-xs text-slate-500">{result.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 border-t border-slate-200">
                  Press Enter to go to first result
                </div>
              </div>
            )}
            
            {showResults && searchTerm.length > 0 && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                <div className="px-4 py-6 text-center">
                  <p className="text-slate-500">No results found for "{searchTerm}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <NotificationDropdown />
        </div>
      </div>
    </div>
  );
};

export default Header;