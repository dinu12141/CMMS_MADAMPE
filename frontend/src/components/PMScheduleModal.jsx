import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { assets, users } from '../mockData';

const PMScheduleModal = ({ isOpen, onClose, onSubmit, pm }) => {
  const [formData, setFormData] = useState({
    name: '',
    assetId: '',
    frequency: 'monthly',
    nextDue: '',
    estimatedDuration: '',
    assignedTo: '',
    priority: 'medium',
    tasks: [''],
    partsRequired: [],
    active: true
  });

  const [taskInputs, setTaskInputs] = useState(['']);
  const [partsInputs, setPartsInputs] = useState(['']);

  useEffect(() => {
    if (pm) {
      setFormData({
        name: pm.name || '',
        assetId: pm.assetId || '',
        frequency: pm.frequency || 'monthly',
        nextDue: pm.nextDue || '',
        estimatedDuration: pm.estimatedDuration || '',
        assignedTo: pm.assignedTo || '',
        priority: pm.priority || 'medium',
        tasks: pm.tasks || [''],
        partsRequired: pm.partsRequired || [],
        active: pm.active !== undefined ? pm.active : true
      });
      setTaskInputs(pm.tasks && pm.tasks.length > 0 ? pm.tasks : ['']);
      setPartsInputs(pm.partsRequired && pm.partsRequired.length > 0 ? pm.partsRequired : ['']);
    } else {
      setFormData({
        name: '',
        assetId: '',
        frequency: 'monthly',
        nextDue: '',
        estimatedDuration: '',
        assignedTo: '',
        priority: 'medium',
        tasks: [''],
        partsRequired: [],
        active: true
      });
      setTaskInputs(['']);
      setPartsInputs(['']);
    }
  }, [pm, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTaskChange = (index, value) => {
    const newTasks = [...taskInputs];
    newTasks[index] = value;
    setTaskInputs(newTasks);
  };

  const addTaskField = () => {
    setTaskInputs([...taskInputs, '']);
  };

  const removeTaskField = (index) => {
    if (taskInputs.length > 1) {
      const newTasks = taskInputs.filter((_, i) => i !== index);
      setTaskInputs(newTasks);
    }
  };

  const handlePartChange = (index, value) => {
    const newParts = [...partsInputs];
    newParts[index] = value;
    setPartsInputs(newParts);
  };

  const addPartField = () => {
    setPartsInputs([...partsInputs, '']);
  };

  const removePartField = (index) => {
    if (partsInputs.length > 1) {
      const newParts = partsInputs.filter((_, i) => i !== index);
      setPartsInputs(newParts);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty tasks and parts
    const tasks = taskInputs.filter(task => task.trim() !== '');
    const partsRequired = partsInputs.filter(part => part.trim() !== '');
    
    const submitData = {
      ...formData,
      tasks,
      partsRequired,
      estimatedDuration: parseFloat(formData.estimatedDuration) || 0
    };
    
    onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {pm ? 'Edit PM Schedule' : 'New PM Schedule'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">PM Schedule Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assetId">Asset *</Label>
                <Select name="assetId" value={formData.assetId} onValueChange={(value) => setFormData(prev => ({...prev, assetId: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map(asset => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} ({asset.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Select name="frequency" value={formData.frequency} onValueChange={(value) => setFormData(prev => ({...prev, frequency: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nextDue">Next Due Date *</Label>
                <Input
                  id="nextDue"
                  name="nextDue"
                  type="date"
                  value={formData.nextDue}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Estimated Duration (hours) *</Label>
                <Input
                  id="estimatedDuration"
                  name="estimatedDuration"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.estimatedDuration}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To *</Label>
                <Select name="assignedTo" value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({...prev, assignedTo: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(user => user.role.includes('Technician')).map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select name="priority" value={formData.priority} onValueChange={(value) => setFormData(prev => ({...prev, priority: value}))}>
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
              
              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    name="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({...prev, active: checked}))}
                  />
                  <Label htmlFor="active">Active Schedule</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Tasks</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTaskField}>
                  Add Task
                </Button>
              </div>
              
              <div className="space-y-3">
                {taskInputs.map((task, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Task ${index + 1}`}
                      value={task}
                      onChange={(e) => handleTaskChange(index, e.target.value)}
                    />
                    {taskInputs.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTaskField(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Parts Required</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPartField}>
                  Add Part
                </Button>
              </div>
              
              <div className="space-y-3">
                {partsInputs.map((part, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Part ${index + 1}`}
                      value={part}
                      onChange={(e) => handlePartChange(index, e.target.value)}
                    />
                    {partsInputs.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePartField(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {pm ? 'Update Schedule' : 'Create Schedule'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PMScheduleModal;