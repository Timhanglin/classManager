import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, addMonths, subMonths } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import AddEventModal from '@/components/calendar/AddEventModal';
import EventDetailModal from '@/components/calendar/EventDetailModal';

export default function CourseCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const queryClient = useQueryClient();

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.ScheduleEvent.list('-date_time', 500),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduleEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowAddModal(false);
      setSelectedDate(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduleEvent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduleEvent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setSelectedEvent(null);
    },
  });

  const handleDateClick = (date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setShowAddModal(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleUpdateAttendance = (eventId, attendees) => {
    updateMutation.mutate({ id: eventId, data: { attendees } });
    setSelectedEvent(prev => prev ? { ...prev, attendees } : null);
  };

  const handleDeleteEvent = (eventId) => {
    deleteMutation.mutate(eventId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">課程行事曆</h1>
          <p className="text-slate-500 mt-1">安排課程與點名紀錄</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
            setShowAddModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          新增排程
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="h-10 w-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-900">
            {format(currentDate, 'yyyy年 M月', { locale: zhTW })}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="h-10 w-10"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      {loadingEvents ? (
        <Skeleton className="h-[600px] rounded-2xl" />
      ) : (
        <CalendarGrid
          currentDate={currentDate}
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      )}

      {/* Add Event Modal */}
      <AddEventModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
        courses={courses}
        students={students}
        initialDate={selectedDate}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
        event={selectedEvent}
        onUpdateAttendance={handleUpdateAttendance}
        onDelete={handleDeleteEvent}
        isUpdating={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}