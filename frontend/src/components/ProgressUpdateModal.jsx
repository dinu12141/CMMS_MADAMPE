import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { workOrdersApi } from '../services/api';

const ProgressUpdateModal = ({ isOpen, onClose, workOrder, onSubmit }) => {
  const [formData, setFormData] = useState({
    progress: 0,
    status: 'open',
    actualTime: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form data when workOrder prop changes
  useEffect(() => {
    if (workOrder) {
      setFormData({
        progress: workOrder.actualTime && workOrder.estimatedTime 
          ? Math.round((workOrder.actualTime / workOrder.estimatedTime) * 100) 
          : 0,
        status: workOrder.status || 'open',
        actualTime: workOrder.actualTime || '',
        notes: workOrder.notes || ''
      });
    }
  }, [workOrder, isOpen]);

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

  const handleSliderChange = (value) => {
    setFormData(prev => ({
      ...prev,
      progress: value[0]
    }));
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
    
    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }
    
    if (formData.actualTime && (isNaN(formData.actualTime) || parseFloat(formData.actualTime) < 0)) {
      newErrors.actualTime = 'Actual time must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm() && workOrder) {
      setLoading(true);
      try {
        // Prepare data for submission
        const submitData = {
          status: formData.status,
          actualTime: formData.actualTime ? parseFloat(formData.actualTime) : 0,
          notes: formData.notes
        };
        
        // Make API call to update work order
        const updatedWorkOrder = await workOrdersApi.update(workOrder.id || workOrder._id, submitData);
        
        // Call onSubmit with the updated work order data
        onSubmit(updatedWorkOrder);
        
        // Close the modal
        onClose();
      } catch (error) {
        console.error('Failed to update work order progress:', error);
        setErrors({ submit: 'Failed to update work order. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!workOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Update Progress for {workOrder.workOrderNumber || workOrder.id}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Work Order: {workOrder.title}</Label>
            <p className="text-sm text-slate-600">{workOrder.description}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="progress">Progress (%)</Label>
            <Slider
              id="progress"
              min={0}
              max={100}
              step={1}
              value={[formData.progress]}
              onValueChange={handleSliderChange}
              className="w-full"
              disabled={loading}
            />
            <div className="flex justify-between text-sm text-slate-600">
              <span>0%</span>
              <span className="font-medium">{formData.progress}%</span>
              <span>100%</span>
            </div>
            {errors.progress && <p className="text-red-500 text-sm">{errors.progress}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              name="status" 
              value={formData.status} 
              onValueChange={(value) => handleSelectChange('status', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="actualTime">Actual Time (hours)</Label>
            <Input
              id="actualTime"
              name="actualTime"
              type="number"
              step="0.5"
              value={formData.actualTime}
              onChange={handleChange}
              placeholder="Enter actual time spent"
              className={errors.actualTime ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.actualTime && <p className="text-red-500 text-sm">{errors.actualTime}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter progress notes"
              rows={3}
              disabled={loading}
            />
          </div>
          
          {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Progress'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressUpdateModal;