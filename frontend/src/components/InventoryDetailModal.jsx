import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Package, 
  Hash,
  Tag,
  MapPin,
  DollarSign,
  User,
  Calendar,
  AlertTriangle,
  TrendingDown,
  CheckCircle
} from 'lucide-react';

const InventoryDetailModal = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  const getStatusInfo = (item) => {
    if (item.status === 'critical') {
      return { color: 'bg-red-100 text-red-700 border-red-300', icon: AlertTriangle, label: 'Critical' };
    } else if (item.status === 'low-stock') {
      return { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: TrendingDown, label: 'Low Stock' };
    } else {
      return { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'In Stock' };
    }
  };

  const statusInfo = getStatusInfo(item);
  const stockPercentage = (item.quantity / item.maxStock) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Inventory Item Details</span>
            <Badge className={statusInfo.color + ' border'}>
              <statusInfo.icon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Header Information */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-slate-500" />
              <span className="font-mono text-lg font-bold text-slate-900">
                {item.partNumber}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {item.name}
            </h2>
            
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600">{item.category}</span>
            </div>
          </div>
          
          {/* Stock Level */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-slate-500" />
              <h3 className="text-lg font-semibold text-slate-900">Stock Level</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Current Stock</span>
                  <span className="font-medium text-slate-900">
                    {item.quantity} / {item.maxStock} {item.unit}
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      stockPercentage < 30 ? 'bg-red-500' :
                      stockPercentage < 50 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${stockPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Min Stock</p>
                  <p className="text-sm font-bold text-slate-900">{item.minStock} {item.unit}</p>
                </div>
                
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Max Stock</p>
                  <p className="text-sm font-bold text-slate-900">{item.maxStock} {item.unit}</p>
                </div>
                
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Available</p>
                  <p className="text-sm font-bold text-slate-900">{item.quantity} {item.unit}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Unit Cost</p>
                  <p className="font-medium">LKR {item.unitCost?.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium">{item.location}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Supplier</p>
                  <p className="font-medium">{item.supplier}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Last Ordered</p>
                  <p className="font-medium">
                    {item.lastOrdered ? new Date(item.lastOrdered).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Description */}
          {item.description && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
              <p className="text-slate-600">
                {item.description}
              </p>
            </div>
          )}
          
          {/* Footer Actions */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryDetailModal;