import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { assetsApi, locationsApi } from '../services/api';

const WorkOrderModal = ({ isOpen, onClose, onSubmit, workOrder, mode = 'create' }) => {
  console.log('WorkOrderModal rendered', { isOpen, mode });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assetId: '',
    priority: 'medium',
    type: 'preventive',
    assignedTo: '',
    dueDate: '',
    estimatedTime: '',
    location: '',
    cost: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [assets, setAssets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch assets and locations when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAssetsAndLocations();
    }
  }, [isOpen]);

  // Initialize form data when workOrder prop changes
  useEffect(() => {
    if (mode === 'edit' && workOrder) {
      // Handle both backend format (_id) and mock data format (id)
      const id = workOrder._id || workOrder.id;

      setFormData({
        title: workOrder.title || '',
        description: workOrder.description || '',
        assetId: workOrder.assetId || '',
        priority: workOrder.priority || 'medium',
        type: workOrder.type || 'preventive',
        assignedTo: workOrder.assignedTo || '',
        // Handle both date formats
        dueDate: workOrder.dueDate ?
          (typeof workOrder.dueDate === 'string' ?
            workOrder.dueDate.slice(0, 16) :
            new Date(workOrder.dueDate).toISOString().slice(0, 16)) : '',
        estimatedTime: workOrder.estimatedTime || '',
        location: workOrder.location || '',
        cost: workOrder.cost || '',
        notes: workOrder.notes || ''
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        assetId: '',
        priority: 'medium',
        type: 'preventive',
        assignedTo: '',
        dueDate: '',
        estimatedTime: '',
        location: '',
        cost: '',
        notes: ''
      });
    }
    setErrors({});
  }, [workOrder, mode, isOpen]);

  const fetchAssetsAndLocations = async () => {
    try {
      setLoading(true);
      // Fetch assets
      const assetsData = await assetsApi.getAll();
      setAssets(assetsData);

      // Fetch locations
      const locationsData = await locationsApi.getAll();
      setLocations(locationsData);
    } catch (error) {
      console.error('Failed to fetch assets and locations:', error);
    } finally {
      setLoading(false);
    }
  };

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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.estimatedTime && (isNaN(formData.estimatedTime) || parseFloat(formData.estimatedTime) < 0)) {
      newErrors.estimatedTime = 'Estimated time must be a positive number';
    }

    if (formData.cost && (isNaN(formData.cost) || parseFloat(formData.cost) < 0)) {
      newErrors.cost = 'Cost must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting Work Order Form', formData);

    if (validateForm()) {
      // Prepare data for submission
      const submitData = {
        ...formData,
        assetId: formData.assetId || null,
        assignedTo: formData.assignedTo || null,
        location: formData.location || null,
        estimatedTime: formData.estimatedTime ? parseFloat(formData.estimatedTime) : 0,
        cost: formData.cost ? parseFloat(formData.cost) : 0
      };

      // Only convert date if it exists
      if (formData.dueDate) {
        // Convert to format expected by backend (YYYY-MM-DDTHH:MM)
        const date = new Date(formData.dueDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        submitData.dueDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      }

      console.log('Sending data to parent:', submitData);
      onSubmit(submitData);
    } else {
      console.log('Validation failed', errors);
    }
  };

  // Auto-populate creation date and time
  useEffect(() => {
    if (mode === 'create' && isOpen) {
      // Set current date and time as default for due date
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setFormData(prev => ({
        ...prev,
        dueDate: `${year}-${month}-${day}T${hours}:${minutes}`
      }));
    }
  }, [mode, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Work Order' : 'Create New Work Order'}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="text-center py-4">
            <p>Loading assets and locations...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter work order title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetId">Asset</Label>
              <Select name="assetId" value={formData.assetId} onValueChange={(value) => handleSelectChange('assetId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map(asset => (
                    <SelectItem key={asset._id || asset.id} value={asset._id || asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                placeholder="Enter assignee name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={handleChange}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
              {errors.dueDate && <p className="text-red-500 text-sm">{errors.dueDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Time (hours)</Label>
              <Input
                id="estimatedTime"
                name="estimatedTime"
                type="number"
                step="0.5"
                value={formData.estimatedTime}
                onChange={handleChange}
                placeholder="Enter estimated time"
                className={errors.estimatedTime ? 'border-red-500' : ''}
              />
              {errors.estimatedTime && <p className="text-red-500 text-sm">{errors.estimatedTime}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost (LKR)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={handleChange}
                placeholder="Enter cost"
                className={errors.cost ? 'border-red-500' : ''}
              />
              {errors.cost && <p className="text-red-500 text-sm">{errors.cost}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Select
                name="location"
                value={formData.location}
                onValueChange={(value) => handleSelectChange('location', value)}
                className={errors.location ? 'border-red-500' : ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location._id || location.id} value={location.name}>
                      {location.name} ({location.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter work order description"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter additional notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'edit' ? 'Update Work Order' : 'Create Work Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderModal;