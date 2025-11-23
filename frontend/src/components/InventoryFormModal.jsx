import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const InventoryFormModal = ({ isOpen, onClose, onSubmit, item, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    category: '',
    description: '',
    quantity: '',
    minStock: '',
    maxStock: '',
    unit: '',
    unitCost: '',
    location: '',
    supplier: ''
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when item prop changes
  useEffect(() => {
    if (mode === 'edit' && item) {
      setFormData({
        partNumber: item.partNumber || '',
        name: item.name || '',
        category: item.category || '',
        description: item.description || '',
        quantity: item.quantity || '',
        minStock: item.minStock || '',
        maxStock: item.maxStock || '',
        unit: item.unit || '',
        unitCost: item.unitCost || '',
        location: item.location || '',
        supplier: item.supplier || ''
      });
    } else {
      // Reset form for create mode
      setFormData({
        partNumber: '',
        name: '',
        category: '',
        description: '',
        quantity: '',
        minStock: '',
        maxStock: '',
        unit: '',
        unitCost: '',
        location: '',
        supplier: ''
      });
    }
    setErrors({});
  }, [item, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user makes a selection
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.partNumber.trim()) {
      newErrors.partNumber = 'Part number is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    
    if (!formData.minStock) {
      newErrors.minStock = 'Minimum stock is required';
    } else if (isNaN(formData.minStock) || parseInt(formData.minStock) < 0) {
      newErrors.minStock = 'Minimum stock must be a positive number';
    }
    
    if (!formData.maxStock) {
      newErrors.maxStock = 'Maximum stock is required';
    } else if (isNaN(formData.maxStock) || parseInt(formData.maxStock) < 0) {
      newErrors.maxStock = 'Maximum stock must be a positive number';
    }
    
    if (parseInt(formData.minStock) > parseInt(formData.maxStock)) {
      newErrors.minStock = 'Minimum stock cannot be greater than maximum stock';
    }
    
    if (!formData.unitCost) {
      newErrors.unitCost = 'Unit cost is required';
    } else if (isNaN(formData.unitCost) || parseFloat(formData.unitCost) < 0) {
      newErrors.unitCost = 'Unit cost must be a positive number';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Supplier is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Prepare data for submission
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        minStock: parseInt(formData.minStock),
        maxStock: parseInt(formData.maxStock),
        unitCost: parseFloat(formData.unitCost)
      };
      
      onSubmit(submitData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partNumber">Part Number *</Label>
              <Input
                id="partNumber"
                name="partNumber"
                value={formData.partNumber}
                onChange={handleChange}
                placeholder="Enter part number"
                className={errors.partNumber ? 'border-red-500' : ''}
                disabled={mode === 'edit'}
              />
              {errors.partNumber && <p className="text-red-500 text-sm">{errors.partNumber}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter item name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category"
                className={errors.category ? 'border-red-500' : ''}
              />
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select name="unit" value={formData.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="meters">Meters</SelectItem>
                  <SelectItem value="kilograms">Kilograms</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="boxes">Boxes</SelectItem>
                  <SelectItem value="kits">Kits</SelectItem>
                </SelectContent>
              </Select>
              {errors.unit && <p className="text-red-500 text-sm">{errors.unit}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock *</Label>
              <Input
                id="minStock"
                name="minStock"
                type="number"
                value={formData.minStock}
                onChange={handleChange}
                placeholder="Enter minimum stock"
                className={errors.minStock ? 'border-red-500' : ''}
              />
              {errors.minStock && <p className="text-red-500 text-sm">{errors.minStock}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxStock">Maximum Stock *</Label>
              <Input
                id="maxStock"
                name="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={handleChange}
                placeholder="Enter maximum stock"
                className={errors.maxStock ? 'border-red-500' : ''}
              />
              {errors.maxStock && <p className="text-red-500 text-sm">{errors.maxStock}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitCost">Unit Cost (LKR) *</Label>
              <Input
                id="unitCost"
                name="unitCost"
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={handleChange}
                placeholder="Enter unit cost"
                className={errors.unitCost ? 'border-red-500' : ''}
              />
              {errors.unitCost && <p className="text-red-500 text-sm">{errors.unitCost}</p>}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="Enter supplier name"
                className={errors.supplier ? 'border-red-500' : ''}
              />
              {errors.supplier && <p className="text-red-500 text-sm">{errors.supplier}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter item description"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'edit' ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryFormModal;