import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Download, FileSpreadsheet, Calendar, Package, User } from 'lucide-react';

const PMExportModal = ({ isOpen, onClose, preventiveMaintenance }) => {
  const [exportOptions, setExportOptions] = useState({
    includeDetails: true,
    includeTasks: true,
    includeParts: true,
    includeHistory: false,
    dateRange: 'all',
    selectedPMs: preventiveMaintenance.map(pm => pm.id)
  });

  const handlePMSelection = (pmId) => {
    setExportOptions(prev => {
      const selectedPMs = prev.selectedPMs.includes(pmId)
        ? prev.selectedPMs.filter(id => id !== pmId)
        : [...prev.selectedPMs, pmId];
      
      return { ...prev, selectedPMs };
    });
  };

  const handleSelectAll = () => {
    setExportOptions(prev => ({
      ...prev,
      selectedPMs: preventiveMaintenance.map(pm => pm.id)
    }));
  };

  const handleDeselectAll = () => {
    setExportOptions(prev => ({
      ...prev,
      selectedPMs: []
    }));
  };

  const exportToExcel = () => {
    // In a real implementation, this would generate an actual Excel file
    // For now, we'll simulate the export
    console.log('Exporting with options:', exportOptions);
    alert('Export functionality would generate an Excel file with the selected PM schedules');
    onClose();
  };

  const filteredPMs = preventiveMaintenance.filter(pm => 
    exportOptions.selectedPMs.includes(pm.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Export PM Schedules
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3">Export Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDetails"
                    checked={exportOptions.includeDetails}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({...prev, includeDetails: checked}))
                    }
                  />
                  <Label htmlFor="includeDetails">Include PM Details</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeTasks"
                    checked={exportOptions.includeTasks}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({...prev, includeTasks: checked}))
                    }
                  />
                  <Label htmlFor="includeTasks">Include Task Lists</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeParts"
                    checked={exportOptions.includeParts}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({...prev, includeParts: checked}))
                    }
                  />
                  <Label htmlFor="includeParts">Include Parts Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeHistory"
                    checked={exportOptions.includeHistory}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({...prev, includeHistory: checked}))
                    }
                  />
                  <Label htmlFor="includeHistory">Include History</Label>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-700">Select PM Schedules</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
                {preventiveMaintenance.map(pm => (
                  <div 
                    key={pm.id} 
                    className="flex items-center gap-3 p-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                  >
                    <Checkbox
                      id={`pm-${pm.id}`}
                      checked={exportOptions.selectedPMs.includes(pm.id)}
                      onCheckedChange={() => handlePMSelection(pm.id)}
                    />
                    <Label htmlFor={`pm-${pm.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{pm.name}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Package className="w-3 h-3" />
                        <span>{pm.assetName}</span>
                        <User className="w-3 h-3 ml-2" />
                        <span>{pm.assignedTo}</span>
                      </div>
                    </Label>
                    <div className="text-xs text-slate-500">
                      {new Date(pm.nextDue).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <FileSpreadsheet className="w-4 h-4" />
                <span>
                  {exportOptions.selectedPMs.length} of {preventiveMaintenance.length} schedules selected
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={exportToExcel}
            disabled={exportOptions.selectedPMs.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PMExportModal;