import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';

const statusConfig = {
  pending: { label: '待確認', icon: AlertCircle, color: 'bg-slate-100 text-slate-600' },
  present: { label: '出席', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  absent: { label: '缺席', icon: XCircle, color: 'bg-red-100 text-red-700' },
  excused: { label: '請假', icon: AlertCircle, color: 'bg-amber-100 text-amber-700' },
};

export default function EventDetailModal({ 
  open, 
  onOpenChange, 
  event, 
  onUpdateAttendance,
  onDelete,
  isUpdating,
  isDeleting 
}) {
  if (!event) return null;

  const eventDate = new Date(event.date_time);

  const handleStatusChange = (studentId, newStatus) => {
    const updatedAttendees = event.attendees.map(a => 
      a.student_id === studentId ? { ...a, status: newStatus } : a
    );
    onUpdateAttendance(event.id, updatedAttendees);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: event.course_color || '#4F46E5' }}
              />
              <DialogTitle className="text-xl font-semibold">
                {event.course_name}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Event Info */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>{format(eventDate, 'yyyy年M月d日 EEEE', { locale: zhTW })}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <span>{format(eventDate, 'HH:mm')}</span>
            </div>
          </div>

          {event.note && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600">{event.note}</p>
            </div>
          )}

          {/* Attendance Section */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-900">
                出席名單 ({event.attendees?.length || 0} 人)
              </span>
            </div>

            {!event.attendees || event.attendees.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <p className="text-sm text-slate-500">尚未新增任何學生</p>
              </div>
            ) : (
              <div className="space-y-3">
                {event.attendees.map((attendee) => {
                  const config = statusConfig[attendee.status] || statusConfig.pending;
                  const StatusIcon = config.icon;

                  return (
                    <div 
                      key={attendee.student_id}
                      className="bg-white border border-slate-100 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-slate-900">
                          {attendee.student_name}
                        </span>
                        <Badge className={`${config.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={attendee.status === 'present' ? 'default' : 'outline'}
                          className={attendee.status === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                          onClick={() => handleStatusChange(attendee.student_id, 'present')}
                          disabled={isUpdating}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          出席
                        </Button>
                        <Button
                          size="sm"
                          variant={attendee.status === 'excused' ? 'default' : 'outline'}
                          className={attendee.status === 'excused' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                          onClick={() => handleStatusChange(attendee.student_id, 'excused')}
                          disabled={isUpdating}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          請假
                        </Button>
                        <Button
                          size="sm"
                          variant={attendee.status === 'absent' ? 'default' : 'outline'}
                          className={attendee.status === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                          onClick={() => handleStatusChange(attendee.student_id, 'absent')}
                          disabled={isUpdating}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          缺席
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delete Button */}
          <div className="pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={() => onDelete(event.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              刪除此排程
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}