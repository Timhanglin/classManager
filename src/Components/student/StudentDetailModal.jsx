import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const statusConfig = {
  present: { label: '出席', icon: CheckCircle2, color: 'text-green-600' },
  absent: { label: '缺席', icon: XCircle, color: 'text-red-600' },
  excused: { label: '請假', icon: AlertCircle, color: 'text-amber-600' },
  pending: { label: '待確認', icon: Clock, color: 'text-slate-400' },
};

export default function StudentDetailModal({ open, onOpenChange, student, events = [], courses = [] }) {
  const studentStats = useMemo(() => {
    if (!student) return null;

    const studentEvents = events.filter(event =>
      event.attendees?.some(a => a.student_id === student.id)
    );

    const courseStats = {};
    
    student.enrollments?.forEach(enrollment => {
      const courseEvents = studentEvents.filter(e => e.course_id === enrollment.course_id);
      const attended = courseEvents.filter(e => 
        e.attendees?.find(a => a.student_id === student.id)?.status === 'present'
      ).length;
      const absent = courseEvents.filter(e => 
        e.attendees?.find(a => a.student_id === student.id)?.status === 'absent'
      ).length;
      const excused = courseEvents.filter(e => 
        e.attendees?.find(a => a.student_id === student.id)?.status === 'excused'
      ).length;

      const remaining = enrollment.total_purchased - attended;

      courseStats[enrollment.course_id] = {
        courseName: enrollment.course_name,
        totalPurchased: enrollment.total_purchased,
        attended,
        absent,
        excused,
        remaining: remaining > 0 ? remaining : 0,
        events: courseEvents,
      };
    });

    const recentEvents = studentEvents
      .sort((a, b) => new Date(b.date_time) - new Date(a.date_time))
      .slice(0, 10);

    return { courseStats, recentEvents };
  }, [student, events]);

  if (!student || !studentStats) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">學生詳細資料</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Student Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-indigo-600">
                {student.name?.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900">{student.name}</h3>
              <div className="space-y-1.5 mt-2">
                {student.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {student.phone}
                  </div>
                )}
                {student.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {student.email}
                  </div>
                )}
              </div>
              {student.note && (
                <p className="text-sm text-slate-500 mt-2 bg-slate-50 rounded-lg p-3">
                  {student.note}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Course Statistics */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              課程統計
            </h4>
            <div className="space-y-3">
              {Object.entries(studentStats.courseStats).map(([courseId, stats]) => (
                <div key={courseId} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-slate-900">{stats.courseName}</h5>
                    <Badge 
                      variant={stats.remaining > 0 ? "default" : "secondary"}
                      className={stats.remaining > 0 ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"}
                    >
                      剩餘 {stats.remaining} / {stats.totalPurchased} 堂
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.attended}</div>
                      <div className="text-xs text-slate-500 mt-1">已出席</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                      <div className="text-xs text-slate-500 mt-1">缺席</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-amber-600">{stats.excused}</div>
                      <div className="text-xs text-slate-500 mt-1">請假</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Recent Attendance */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              最近出缺席記錄
            </h4>
            {studentStats.recentEvents.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-8 text-center">
                <p className="text-sm text-slate-500">尚無出缺席記錄</p>
              </div>
            ) : (
              <div className="space-y-2">
                {studentStats.recentEvents.map((event) => {
                  const attendance = event.attendees?.find(a => a.student_id === student.id);
                  const status = attendance?.status || 'pending';
                  const StatusIcon = statusConfig[status]?.icon || Clock;

                  return (
                    <div 
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-1 h-12 rounded-full"
                          style={{ backgroundColor: event.course_color || '#4F46E5' }}
                        />
                        <div>
                          <div className="font-medium text-slate-900">{event.course_name}</div>
                          <div className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(event.date_time), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`flex items-center gap-1.5 ${statusConfig[status]?.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig[status]?.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}