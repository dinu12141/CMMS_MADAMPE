import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Plus,
  Calendar,
  List,
  Download,
  Clock,
  User,
  CheckCircle2,
  Package,
  Filter,
  Search
} from 'lucide-react';
import { preventiveMaintenance, assets, users } from '../mockData';
import { pmApi } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import PMCalendarView from '../components/PMCalendarView';
import PMListView from '../components/PMListView';
import PMScheduleModal from '../components/PMScheduleModal';
import PMDetailViewModal from '../components/PMDetailViewModal';
import PMExportModal from '../components/PMExportModal';

const PreventiveMaintenance = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [pms, setPms] = useState([]);
  const [filteredPms, setFilteredPms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailViewModal, setShowDetailViewModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedPM, setSelectedPM] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const frequencies = ['all', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
  const priorities = ['all', 'low', 'medium', 'high', 'critical'];
  const statuses = ['all', 'active', 'inactive'];
  const { showSuccess, showError } = useNotification();

  // Load PMs on component mount
  useEffect(() => {
    loadPMs();
  }, []);

  // Apply filters when PMs or filter values change
  useEffect(() => {
    applyFilters();
  }, [pms, searchTerm, frequencyFilter, priorityFilter, statusFilter]);

  const loadPMs = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the API
      // const data = await pmApi.getAll();
      // For now, we'll use mock data
      setPms(preventiveMaintenance);
    } catch (err) {
      console.error('Failed to load PMs', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = pms;

    // Search term filter
    if (searchTerm) {
      result = result.filter(pm =>
        pm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pm.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pm.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pm.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Frequency filter
    if (frequencyFilter !== 'all') {
      result = result.filter(pm => pm.frequency === frequencyFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(pm => pm.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      result = result.filter(pm => pm.active === isActive);
    }

    setFilteredPms(result);
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'daily': return 'bg-blue-100 text-blue-700';
      case 'weekly': return 'bg-purple-100 text-purple-700';
      case 'monthly': return 'bg-green-100 text-green-700';
      case 'quarterly': return 'bg-orange-100 text-orange-700';
      case 'yearly': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const calculateDaysUntil = (dateString) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDetails = (pm) => {
    setSelectedPM(pm);
    setShowDetailViewModal(true);
  };

  const handleGenerateWO = async (pm) => {
    try {
      await pmApi.generateWorkOrder(pm.id || pm._id);
      showSuccess('Work Order Created', `Generated from PM schedule ${pm.name}`);
    } catch (err) {
      console.error('Failed to generate work order from PM', err);
      showError('Generation Failed', err.message || 'Could not generate work order. Please try again.');
    }
  };

  const handleNewSchedule = () => {
    setSelectedPM(null);
    setIsEditing(false);
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (pm) => {
    setSelectedPM(pm);
    setIsEditing(true);
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async (pmData) => {
    try {
      if (isEditing) {
        // In a real app, this would update via the API
        // await pmApi.update(selectedPM.id, pmData);
        // For now, we'll just update locally
        setPms(pms.map(pm =>
          pm.id === selectedPM.id ? { ...pm, ...pmData } : pm
        ));
      } else {
        // In a real app, this would create via the API
        // const newPM = await pmApi.create(pmData);
        // For now, we'll just add locally
        const newPM = {
          id: `PM-${pms.length + 1}`,
          pmNumber: `PM-${pms.length + 1}`,
          ...pmData
        };
        setPms([...pms, newPM]);
      }
      setShowScheduleModal(false);
    } catch (err) {
      console.error('Failed to save PM schedule', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto animate-spin" />
          <p className="mt-2 text-slate-500">Loading PM schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Preventive Maintenance"
        subtitle="Schedule and manage preventive maintenance tasks"
      />

      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search PM schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-md overflow-hidden border border-slate-300">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                className="rounded-none border-0"
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                className="rounded-none border-0 border-l border-slate-300"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowExportModal(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleNewSchedule}
            >
              <Plus className="w-4 h-4 mr-2" />
              New PM Schedule
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Frequency</label>
              <select
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {frequencies.map(freq => (
                  <option key={freq} value={freq}>
                    {freq === 'all' ? 'All Frequencies' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setFrequencyFilter('all');
                setPriorityFilter('all');
                setStatusFilter('all');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Showing {filteredPms.length} of {pms.length} PM schedules
          </p>
        </div>

        {/* View Content */}
        {viewMode === 'calendar' ? (
          <PMCalendarView
            preventiveMaintenance={filteredPms}
            onViewDetails={handleViewDetails}
            onGenerateWO={handleGenerateWO}
          />
        ) : (
          <PMListView
            preventiveMaintenance={filteredPms}
            onViewDetails={handleViewDetails}
            onGenerateWO={handleGenerateWO}
          />
        )}
      </div>

      {/* Modals */}
      <PMScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleSaveSchedule}
        pm={selectedPM}
      />

      <PMDetailViewModal
        isOpen={showDetailViewModal}
        onClose={() => setShowDetailViewModal(false)}
        pm={selectedPM}
      />

      <PMExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        preventiveMaintenance={pms}
      />
    </div>
  );
};

export default PreventiveMaintenance;