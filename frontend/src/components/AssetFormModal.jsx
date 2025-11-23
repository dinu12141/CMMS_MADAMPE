import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';

const AssetFormModal = ({ isOpen, onClose, onSubmit, asset, isEditing }) => {
  const [formData, setFormData] = useState({
    assetNumber: '',
    name: '',
    category: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    installDate: '',
    warrantyExpiry: '',
    location: '',
    criticality: 'medium',
    specifications: {}
  });

  const [specFields, setSpecFields] = useState([
    { key: '', value: '' }
  ]);

  useEffect(() => {
    if (isEditing && asset) {
      setFormData({
        assetNumber: asset.assetNumber || '',
        name: asset.name || '',
        category: asset.category || '',
        manufacturer: asset.manufacturer || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        purchaseDate: asset.purchaseDate || '',
        installDate: asset.installDate || '',
        warrantyExpiry: asset.warrantyExpiry || '',
        location: asset.location || '',
        criticality: asset.criticality || 'medium',
        specifications: asset.specifications || {}
      });
      
      // Convert specifications object to array for form editing
      if (asset.specifications) {
        const specEntries = Object.entries(asset.specifications);
        if (specEntries.length > 0) {
          setSpecFields(specEntries.map(([key, value]) => ({ key, value })));
        } else {
          setSpecFields([{ key: '', value: '' }]);
        }
      } else {
        setSpecFields([{ key: '', value: '' }]);
      }
    } else {
      setFormData({
        assetNumber: '',
        name: '',
        category: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        installDate: '',
        warrantyExpiry: '',
        location: '',
        criticality: 'medium',
        specifications: {}
      });
      setSpecFields([{ key: '', value: '' }]);
    }
  }, [isEditing, asset, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecFields = [...specFields];
    newSpecFields[index][field] = value;
    setSpecFields(newSpecFields);
  };

  const addSpecField = () => {
    setSpecFields([...specFields, { key: '', value: '' }]);
  };

  const removeSpecField = (index) => {
    if (specFields.length > 1) {
      const newSpecFields = specFields.filter((_, i) => i !== index);
      setSpecFields(newSpecFields);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert spec fields array back to object
    const specifications = {};
    specFields.forEach(field => {
      if (field.key.trim() !== '') {
        specifications[field.key.trim()] = field.value.trim();
      }
    });
    
    const submitData = {
      ...formData,
      specifications
    };
    
    // If assetNumber is empty and we're adding a new asset, remove it so backend can generate
    if (!isEditing && !submitData.assetNumber.trim()) {
      delete submitData.assetNumber;
    }
    
    onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Asset' : 'Add New Asset with ID'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Asset Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assetNumber">Asset ID</Label>
                <Input
                  id="assetNumber"
                  name="assetNumber"
                  value={formData.assetNumber}
                  onChange={handleChange}
                  placeholder="Leave blank to auto-generate"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer *</Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="installDate">Installation Date</Label>
                <Input
                  id="installDate"
                  name="installDate"
                  type="date"
                  value={formData.installDate}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  name="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="criticality">Criticality</Label>
                <Select name="criticality" value={formData.criticality} onValueChange={(value) => setFormData(prev => ({...prev, criticality: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Specifications</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSpecField}>
                  Add Specification
                </Button>
              </div>
              
              <div className="space-y-3">
                {specFields.map((field, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-10 gap-2 items-end">
                    <div className="md:col-span-4">
                      <Input
                        placeholder="Key (e.g., capacity)"
                        value={field.key}
                        onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-5">
                      <Input
                        placeholder="Value (e.g., 50 tons)"
                        value={field.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-1">
                      {specFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSpecField(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Asset' : 'Add Asset'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AssetFormModal;