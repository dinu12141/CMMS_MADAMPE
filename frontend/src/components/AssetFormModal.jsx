import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { assetsApi } from '../services/api';

const AssetFormModal = ({ isOpen, onClose, onSubmit, asset, isEditing, locations = [] }) => {
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
    specifications: {},
    image: null // Added image field
  });

  const [specFields, setSpecFields] = useState([
    { key: '', value: '' }
  ]);
  
  const [imagePreview, setImagePreview] = useState(null); // Added image preview state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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
        location: asset.location || '', // This should be the location ID
        criticality: asset.criticality || 'medium',
        specifications: asset.specifications || {},
        image: asset.imageUrl || null // Load existing image if editing
      });
      
      // Set image preview if editing and asset has an image
      if (asset.imageUrl) {
        setImagePreview(asset.imageUrl);
      }
      
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
        specifications: {},
        image: null
      });
      setSpecFields([{ key: '', value: '' }]);
      setImagePreview(null); // Reset image preview when adding new asset
    }
  }, [isEditing, asset, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSubmitError(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
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

  // Added function to handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // Store the file for submission
        setFormData(prev => ({
          ...prev,
          image: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.location) {
      alert('Please fill in all required fields (Asset Name and Location)');
      return;
    }
    
    // Convert spec fields array back to object
    const specifications = {};
    specFields.forEach(field => {
      if (field.key.trim() !== '') {
        specifications[field.key.trim()] = field.value.trim();
      }
    });
    
    setSubmitError(null);
    setSubmitting(true);
    
    try {
      let imageUrl = typeof formData.image === 'string' ? formData.image : asset?.imageUrl;
      
      if (formData.image && formData.image instanceof File) {
        const uploadResult = await assetsApi.uploadImage(formData.image);
        imageUrl = uploadResult.url;
      }
      
      const submitData = {
        name: formData.name,
        location: formData.location,
        specifications,
      };
      
      if (formData.assetNumber && formData.assetNumber.trim()) {
        submitData.assetNumber = formData.assetNumber.trim();
      }
      if (formData.category) submitData.category = formData.category;
      if (formData.manufacturer) submitData.manufacturer = formData.manufacturer;
      if (formData.model) submitData.model = formData.model;
      if (formData.serialNumber) submitData.serialNumber = formData.serialNumber;
      if (formData.purchaseDate) submitData.purchaseDate = formData.purchaseDate;
      if (formData.installDate) submitData.installDate = formData.installDate;
      if (formData.warrantyExpiry) submitData.warrantyExpiry = formData.warrantyExpiry;
      if (formData.criticality) submitData.criticality = formData.criticality;
      if (imageUrl) submitData.imageUrl = imageUrl;
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Failed to save asset', error);
      setSubmitError(error.message || 'Failed to save asset. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Asset' : 'Add New Asset'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section - Added at the top */}
            <div className="space-y-2">
              <Label htmlFor="image">Asset Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Asset Preview" 
                    className="w-full h-48 object-contain rounded-lg border"
                  />
                </div>
              )}
            </div>
            
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
                <Label htmlFor="location">Location *</Label>
                <Select 
                  name="location" 
                  value={formData.location} 
                  onValueChange={(value) => handleSelectChange('location', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc._id || loc.id} value={loc._id || loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Optional Fields Section */}
            <div className="border-t border-slate-200 pt-4 mt-4">
              <h3 className="text-lg font-medium mb-4">Optional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
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
                  <Select 
                    name="criticality" 
                    value={formData.criticality} 
                    onValueChange={(value) => handleSelectChange('criticality', value)}
                  >
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
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : (isEditing ? 'Update Asset' : 'Add Asset')}
              </Button>
            </div>
            
            {submitError && (
              <p className="text-sm text-red-500">{submitError}</p>
            )}
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AssetFormModal;