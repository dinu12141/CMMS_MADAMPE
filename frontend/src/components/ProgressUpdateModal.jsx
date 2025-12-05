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
      const progress = workOrder.actualTime && workOrder.estimatedTime 
        ? Math.round((workOrder.actualTime / workOrder.estimatedTime) * 100) 
        : 0;
      
      // Determine status based on progress
      let status = workOrder.status || 'open';
      if (progress >= 10 && progress < 100) {
        status = 'in-progress';
      } else if (progress >= 100) {
        status = 'completed';
      }
      
      setFormData({
        progress: progress,
        status: status,
        actualTime: workOrder.actualTime ? workOrder.actualTime.toString() : '',
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
    const progress = value[0];
    setFormData(prev => {
      // Automatically update status based on progress
      let newStatus = prev.status;
      if (progress >= 10 && progress < 100) {
        newStatus = 'in-progress';
      } else if (progress >= 100) {
        newStatus = 'completed';
      } else if (progress < 10 && prev.status === 'in-progress') {
        newStatus = 'open';
      }
      
      // Calculate actual time based on progress and estimated time
      let actualTime = prev.actualTime;
      if (workOrder && workOrder.estimatedTime) {
        actualTime = (progress / 100) * workOrder.estimatedTime;
      }
      
      return {
        ...prev,
        progress: progress,
        status: newStatus,
        actualTime: actualTime.toFixed(1)
      };
    });
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
          actualTime: parseFloat(formData.actualTime),
          notes: formData.notes
        };
        
        // Make API call to update work order
        const updatedWorkOrder = await workOrdersApi.updateProgress(workOrder.id || workOrder._id, submitData);
        
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

  // Handle cancel action
  const handleCancel = async () => {
    if (workOrder) {
      setLoading(true);
      try {
        // Update work order status to cancelled
        const submitData = {
          status: 'cancelled'
        };
        
        const updatedWorkOrder = await workOrdersApi.updateProgress(workOrder.id || workOrder._id, submitData);
        
        // Call onSubmit with the updated work order data
        onSubmit(updatedWorkOrder);
        
        // Close the modal
        onClose();
      } catch (error) {
        console.error('Failed to cancel work order:', error);
        setErrors({ submit: 'Failed to cancel work order. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle on hold action
  const handleOnHold = async () => {
    if (workOrder) {
      setLoading(true);
      try {
        // Update work order status to on-hold
        const submitData = {
          status: 'on-hold'
        };
        
        const updatedWorkOrder = await workOrdersApi.updateProgress(workOrder.id || workOrder._id, submitData);
        
        // Call onSubmit with the updated work order data
        onSubmit(updatedWorkOrder);
        
        // Close the modal
        onClose();
      } catch (error) {
        console.error('Failed to put work order on hold:', error);
        setErrors({ submit: 'Failed to put work order on hold. Please try again.' });
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
              <span className="font-medium text-lg">{formData.progress}%</span>
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
          
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Close
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Progress'}
              </Button>
            </div>
            
            <div className="flex justify-between gap-3 pt-2 border-t border-slate-200">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleCancel} 
                disabled={loading}
                className="flex-1"
              >
                Cancel Work Order
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleOnHold} 
                disabled={loading}
                className="flex-1"
              >
                Put On Hold
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressUpdateModal;