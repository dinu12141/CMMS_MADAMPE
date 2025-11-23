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
  AlertTriangle,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import { inventoryApi } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import InventoryFormModal from '../components/InventoryFormModal';
import InventoryDetailModal from '../components/InventoryDetailModal';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  
  const { showSuccess, showError } = useNotification();

  // Load inventory on component mount
  useEffect(() => {
    loadInventory();
  }, []);

  // Test API connection periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Simple ping to check if API is available
      fetch('http://localhost:8000/api/')
        .then(response => {
          if (response.ok) {
            console.log('API is reachable');
          }
        })
        .catch(error => {
          console.log('API is not reachable:', error);
        });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Apply filters when inventory or filter values change
  useEffect(() => {
    applyFilters();
  }, [inventoryData, searchTerm, statusFilter]);

  const loadInventory = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      // Try to fetch from API, but use mock data if API fails
      try {
        const data = await inventoryApi.getAll();
        setInventoryData(data);
        showSuccess('Inventory Loaded', `Successfully loaded ${data.length} inventory items`);
      } catch (apiError) {
        console.error('Failed to load inventory from API, using mock data', apiError);
        
        // Retry mechanism - try up to 3 times with exponential backoff
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`Retrying in ${delay}ms... (${retryCount + 1}/3)`);
          setTimeout(() => loadInventory(retryCount + 1), delay);
          return;
        }
        
        // Use mock data as fallback after retries
        const mockData = [
          {
            _id: 'INV-001',
            partNumber: 'Filter-24x24',
            name: 'HVAC Air Filter 24x24x2',
            category: 'Filters',
            description: 'MERV 11 pleated air filter',
            quantity: 24,
            minStock: 12,
            maxStock: 48,
            unit: 'pieces',
            unitCost: 15.50,
            location: 'Warehouse - A12',
            supplier: 'FilterCo Inc',
            lastOrdered: '2024-12-01',
            status: 'in-stock'
          },
          {
            _id: 'INV-002',
            partNumber: 'Bearing-2205',
            name: 'Ball Bearing 2205-2RS',
            category: 'Bearings',
            description: 'Self-aligning ball bearing with rubber seals',
            quantity: 8,
            minStock: 10,
            maxStock: 30,
            unit: 'pieces',
            unitCost: 45.00,
            location: 'Warehouse - B05',
            supplier: 'Industrial Supply Co',
            lastOrdered: '2025-01-18',
            status: 'low-stock'
          },
          {
            _id: 'INV-003',
            partNumber: 'Seal-Kit-A',
            name: 'Pump Seal Repair Kit',
            category: 'Seals',
            description: 'Complete seal kit for water pumps',
            quantity: 15,
            minStock: 8,
            maxStock: 24,
            unit: 'kits',
            unitCost: 78.00,
            location: 'Warehouse - B08',
            supplier: 'Pump Parts LLC',
            lastOrdered: '2024-11-20',
            status: 'in-stock'
          },
          {
            _id: 'INV-004',
            partNumber: 'Compressor-Oil-5L',
            name: 'Synthetic Compressor Oil 5L',
            category: 'Lubricants',
            description: 'Full synthetic compressor oil',
            quantity: 32,
            minStock: 20,
            maxStock: 60,
            unit: 'liters',
            unitCost: 25.00,
            location: 'Warehouse - C15',
            supplier: 'Lubes & Oils Direct',
            lastOrdered: '2024-12-10',
            status: 'in-stock'
          },
          {
            _id: 'INV-005',
            partNumber: 'LED-48W',
            name: 'LED Panel Light 48W',
            category: 'Lighting',
            description: '600x600 LED panel, 4800 lumens',
            quantity: 3,
            minStock: 12,
            maxStock: 36,
            unit: 'pieces',
            unitCost: 42.00,
            location: 'Warehouse - D20',
            supplier: 'Lighting Solutions Inc',
            lastOrdered: '2025-01-16',
            status: 'critical'
          }
        ];
        setInventoryData(mockData);
        showError('API Connection Failed', 'Could not connect to the server. Displaying demo data. Please ensure MongoDB is running and the backend server is started.');
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
      setError('Failed to load inventory: ' + err.message);
      showError('Load Error', 'Failed to load inventory. Please try again. Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = inventoryData;
    
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.partNumber.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    setFilteredInventory(result);
  };

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
    all: inventoryData.length,
    'in-stock': inventoryData.filter(i => i.status === 'in-stock').length,
    'low-stock': inventoryData.filter(i => i.status === 'low-stock').length,
    'critical': inventoryData.filter(i => i.status === 'critical').length
  };

  const handleAddItem = () => {
    setCurrentItem(null);
    setModalMode('create');
    setShowFormModal(true);
  };

  const handleViewDetails = (item) => {
    setCurrentItem(item);
    setShowDetailModal(true);
  };

  const handleEditItem = (item) => {
    setCurrentItem(item);
    setModalMode('edit');
    setShowFormModal(true);
  };

  const handleSaveItem = async (itemData) => {
    try {
      if (modalMode === 'create') {
        // Try to save to API first, fallback to local state if API fails
        try {
          const savedItem = await inventoryApi.create(itemData);
          setInventoryData([...inventoryData, savedItem]);
          showSuccess('Item Created', 'New inventory item has been successfully created');
        } catch (apiError) {
          console.error('Failed to save to API, using local state', apiError);
          // Fallback to local state
          const newItem = {
            _id: `INV-${inventoryData.length + 1}`,
            ...itemData,
            status: itemData.quantity <= itemData.minStock ? 'low-stock' : 
                    itemData.quantity <= itemData.minStock * 0.5 ? 'critical' : 'in-stock'
          };
          setInventoryData([...inventoryData, newItem]);
          showSuccess('Item Created (Local)', 'Item saved locally. Start the backend to sync with database.');
        }
      } else if (modalMode === 'edit' && currentItem) {
        // Try to update via API first, fallback to local state if API fails
        try {
          const updatedItem = await inventoryApi.update(currentItem._id, itemData);
          setInventoryData(inventoryData.map(item => 
            item._id === currentItem._id ? updatedItem : item
          ));
          showSuccess('Item Updated', 'Inventory item has been successfully updated');
        } catch (apiError) {
          console.error('Failed to update via API, using local state', apiError);
          // Fallback to local state
          const updatedItem = {
            ...currentItem,
            ...itemData,
            status: itemData.quantity <= itemData.minStock ? 'low-stock' : 
                    itemData.quantity <= itemData.minStock * 0.5 ? 'critical' : 'in-stock'
          };
          setInventoryData(inventoryData.map(item => 
            item._id === currentItem._id ? updatedItem : item
          ));
          showSuccess('Item Updated (Local)', 'Item updated locally. Start the backend to sync with database.');
        }
      }
      setShowFormModal(false);
      setCurrentItem(null);
    } catch (err) {
      console.error('Failed to save inventory item', err);
      showError('Save Error', `Failed to save inventory item: ${err.message}`);
    }
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setCurrentItem(null);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setCurrentItem(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-slate-400 mx-auto animate-spin" />
          <p className="mt-2 text-slate-500">Loading inventory...</p>
          <p className="mt-1 text-slate-400 text-sm">Connecting to database</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to Load Inventory</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4 text-left">
            <h3 className="font-bold text-yellow-800 mb-2">Troubleshooting Tips:</h3>
            <ul className="text-yellow-700 text-sm list-disc pl-5 space-y-1">
              <li>Ensure MongoDB is running on your system</li>
              <li>Start the backend server by running <code className="bg-gray-100 px-1 rounded">start_backend.bat</code></li>
              <li>Check that the backend is accessible at <code className="bg-gray-100 px-1 rounded">http://localhost:8000</code></li>
            </ul>
          </div>
          <Button className="mt-4" onClick={loadInventory}>Retry</Button>
        </div>
      </div>
    );
  }

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
            {/* Removed Generate PO button as requested */}
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddItem}>
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
              <Card key={item._id} className="hover:shadow-lg transition-all duration-200">
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
                        <p className="text-sm font-medium text-slate-900">LKR {item.unitCost?.toLocaleString()}</p>
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
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(item)}>
                      Details
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handleEditItem(item)}>
                      Edit
                    </Button>
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
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <InventoryFormModal
        isOpen={showFormModal}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveItem}
        item={currentItem}
        mode={modalMode}
      />
      
      <InventoryDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        item={currentItem}
      />
    </div>
  );
};

export default Inventory;