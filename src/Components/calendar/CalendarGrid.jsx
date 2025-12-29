import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarGrid({ currentDate, events = [], onDateClick, onEventClick }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = [];
  let day = calendarStart;

  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date_time);
      return isSameDay(eventDate, date);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {/* Week Headers */}
      <div className="grid grid-cols-7 bg-slate-50">
        {weekDays.map((dayName, idx) => (
          <div 
            key={idx}
            className={cn(
              "py-3 text-center text-sm font-medium",
              idx === 0 ? "text-red-500" : idx === 6 ? "text-indigo-500" : "text-slate-600"
            )}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7">
        {days.map((dayDate, idx) => {
          const dayEvents = getEventsForDay(dayDate);
          const isCurrentMonth = isSameMonth(dayDate, currentDate);
          const isCurrentDay = isToday(dayDate);
          const dayOfWeek = dayDate.getDay();

          return (
            <div
              key={idx}
              onClick={() => onDateClick(dayDate)}
              className={cn(
                "min-h-24 md:min-h-32 p-1 md:p-2 border-t border-l border-slate-100 cursor-pointer transition-colors hover:bg-slate-50",
                !isCurrentMonth && "bg-slate-50/50"
              )}
            >
              <div className="flex justify-center md:justify-start">
                <span 
                  className={cn(
                    "w-7 h-7 flex items-center justify-center text-sm rounded-full transition-colors",
                    isCurrentDay && "bg-indigo-600 text-white font-semibold",
                    !isCurrentDay && isCurrentMonth && (
                      dayOfWeek === 0 ? "text-red-500" : dayOfWeek === 6 ? "text-indigo-500" : "text-slate-700"
                    ),
                    !isCurrentMonth && "text-slate-300"
                  )}
                >
                  {format(dayDate, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="mt-1 space-y-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event, eventIdx) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="group relative"
                  >
                    <div
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded truncate cursor-pointer transition-all",
                        "hover:opacity-80"
                      )}
                      style={{ 
                        backgroundColor: `${event.course_color || '#4F46E5'}20`,
                        color: event.course_color || '#4F46E5',
                        borderLeft: `2px solid ${event.course_color || '#4F46E5'}`
                      }}
                    >
                      <span className="hidden md:inline">
                        {format(new Date(event.date_time), 'HH:mm')} 
                      </span>
                      <span className="md:ml-1">{event.course_name}</span>
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-400 text-center">
                    +{dayEvents.length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}