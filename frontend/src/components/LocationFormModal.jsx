import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { locationsApi } from '../services/api';

const LocationFormModal = ({ isOpen, onClose, onSubmit, location = null, mode = 'create' }) => {
  const predefinedLocations = [
    'VCO Plant',
    'Madampe Plant (DS)',
    'Madampe Plant (CS)',
    'Wet Section',
    'Pairing Section',
    'Sifter Section',
    'Thambagalla Section',
    'Generator Section',
    'Boiler Section'
  ];

  const [formData, setFormData] = useState({
    name: '',
    type: 'building',
    size: 0,
    floors: 0,
    image: null
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (location && mode === 'edit') {
      setFormData({
        name: location.name || '',
        type: location.type || 'building',
        size: location.size || 0,
        floors: location.floors || 0,
        image: location.imageUrl || null
      });
      setImagePreview(location.imageUrl || null);
    } else if (mode === 'create') {
      setFormData({
        name: '',
        type: 'building',
        size: 0,
        floors: 0,
        image: null
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [location, mode]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        let finalData = {
          name: formData.name,
          type: formData.type,
          address: '',
          city: '',
          state: '',
          zipCode: '',
          coordinates: { lat: 0.0, lng: 0.0 },
          size: parseInt(formData.size) || 0,
          floors: parseInt(formData.floors) || 0
        };

        // Handle image upload
        if (imageFile && mode === 'edit' && location?.id) {
          // For editing, upload image directly to the location
          const uploadResult = await locationsApi.uploadImage(location.id, imageFile);
          finalData.imageUrl = uploadResult.imageUrl;
          onSubmit(finalData);
        } else if (imageFile && mode === 'create') {
          // For creating, we'll use the two-step process as suggested
          // First create the location without image
          onSubmit(finalData);
          // Image will be uploaded after location is created via the Detail View or Edit
        } else {
          // No image to upload, just submit the data
          onSubmit(finalData);
        }
      } catch (error) {
        console.error('Error handling image upload:', error);
        // Submit form data even if image upload fails
        const submitData = {
          name: formData.name,
          type: formData.type,
          address: '',
          city: '',
          state: '',
          zipCode: '',
          coordinates: { lat: 0.0, lng: 0.0 },
          size: parseInt(formData.size) || 0,
          floors: parseInt(formData.floors) || 0,
          imageUrl: formData.image || null
        };
        onSubmit(submitData);
      }
    }
  };

  const handleClose = () => {
    setErrors({});
    setImagePreview(null);
    setImageFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Location' : 'Edit Location'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Location Name *</Label>
              <Select
                value={formData.name}
                onValueChange={(value) => handleSelectChange('name', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="building">Building</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="facility">Facility</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size (sq ft)</Label>
              <Input
                id="size"
                name="size"
                type="number"
                value={formData.size}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floors">Floors</Label>
              <Input
                id="floors"
                name="floors"
                type="number"
                value={formData.floors}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="image">Location Image</Label>
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
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Add Location' : 'Update Location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationFormModal;