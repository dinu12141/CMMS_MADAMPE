import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, X, Package, ClipboardList, MapPin, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ title, subtitle, showSearch = true, showNotifications = true }) => {
  const searchRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle clicks outside the search box to close results
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

  const handleSearch = (term) => {
    setSearchTerm(term);
    // In a real app, you would call an API here to get search results
    // For now, we'll just show some mock results if there's a term
    if (term.trim()) {
      const mockResults = [
        { id: 1, type: 'asset', title: 'Motor Pump A1', subtitle: 'Asset - Location 1', icon: Package },
        { id: 2, type: 'workorder', title: 'WO-2025-001', subtitle: 'Work Order - Open', icon: ClipboardList },
        { id: 3, type: 'location', title: 'Building A', subtitle: 'Location - Main Campus', icon: MapPin },
      ];
      setSearchResults(mockResults);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleResultSelect(searchResults[0]);
    }
  };

  const handleResultSelect = (result) => {
    // In a real app, you would navigate to the appropriate page
    console.log('Selected result:', result);
    setSearchTerm('');
    setShowResults(false);
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
          {showSearch && (
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
          )}

          {/* User Info and Logout */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{user.username}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Notifications */}
          {showNotifications && <NotificationDropdown />}
        </div>
      </div>
    </div>
  );
};

export default Header;