import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  CheckCircle2,
  Package
} from 'lucide-react';

const PMCalendarView = ({ preventiveMaintenance, onViewDetails, onGenerateWO }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
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

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getPMsForDate = (date) => {
    return preventiveMaintenance.filter(pm => {
      const pmDate = new Date(pm.nextDue);
      return isSameDay(pmDate, date);
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Previous month's days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(year, month - 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Next month's days
    const totalCells = 42; // 6 weeks * 7 days
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const calendarDays = renderCalendar();

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateMonth(1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-slate-500">
            {day}
          </div>
        ))}
        
        {calendarDays.map((dayObj, index) => {
          const { date, isCurrentMonth } = dayObj;
          const dayPMs = getPMsForDate(date);
          const isToday = isSameDay(date, new Date());
          
          return (
            <div 
              key={index} 
              className={`min-h-24 p-1 border border-slate-200 ${
                isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className={`text-right p-1 text-sm ${
                isToday ? 'font-bold text-blue-600' : ''
              }`}>
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayPMs.slice(0, 3).map(pm => {
                  const daysUntil = calculateDaysUntil(pm.nextDue);
                  const isOverdue = daysUntil < 0;
                  const isDueSoon = daysUntil >= 0 && daysUntil <= 7;
                  
                  return (
                    <Card 
                      key={pm.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        isOverdue ? 'border-red-300 border' : isDueSoon ? 'border-orange-300 border' : ''
                      }`}
                      onClick={() => onViewDetails(pm)}
                    >
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium truncate">{pm.name}</span>
                          <Badge className={`${getFrequencyColor(pm.frequency)} text-xs px-1 py-0`}>
                            {pm.frequency.charAt(0)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Package className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-600 truncate">{pm.assetName}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {dayPMs.length > 3 && (
                  <div className="text-xs text-slate-500 text-center">
                    +{dayPMs.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PMCalendarView;