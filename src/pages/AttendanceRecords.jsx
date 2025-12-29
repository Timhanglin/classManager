import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { 
  Search, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BookOpen,
  ArrowUpDown,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusConfig = {
  pending: { label: '待確認', icon: AlertCircle, color: 'bg-slate-100 text-slate-600' },
  present: { label: '出席', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  absent: { label: '缺席', icon: XCircle, color: 'bg-red-100 text-red-700' },
  excused: { label: '請假', icon: AlertCircle, color: 'bg-amber-100 text-amber-700' },
};

export default function AttendanceRecords() {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('remaining_desc');

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list('-created_date', 100),
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.ScheduleEvent.list('-date_time', 500),
  });

  // Calculate stats for ALL students
  const allStudentsStats = useMemo(() => {
    return students.map(student => {
      const studentEvents = events.filter(event => 
        event.attendees?.some(a => a.student_id === student.id)
      );

      const attendanceRecords = studentEvents.map(event => {
        const attendee = event.attendees.find(a => a.student_id === student.id);
        return {
          event,
          status: attendee?.status || 'pending',
          date: new Date(event.date_time)
        };
      }).sort((a, b) => b.date - a.date);

      const statusCounts = {
        present: attendanceRecords.filter(r => r.status === 'present').length,
        absent: attendanceRecords.filter(r => r.status === 'absent').length,
        excused: attendanceRecords.filter(r => r.status === 'excused').length,
        pending: attendanceRecords.filter(r => r.status === 'pending').length,
      };

      const courseStats = (student.enrollments || []).map(enrollment => {
        const usedSessions = events.filter(event => 
          event.course_id === enrollment.course_id &&
          event.attendees?.some(a => 
            a.student_id === student.id && 
            (a.status === 'present' || a.status === 'absent')
          )
        ).length;

        return {
          ...enrollment,
          sessions_used: usedSessions,
          sessions_remaining: enrollment.total_purchased - usedSessions
        };
      });

      const totalRemaining = courseStats.reduce((sum, c) => sum + c.sessions_remaining, 0);
      const hasCompletedCourses = courseStats.some(c => c.sessions_remaining <= 0);

      return {
        student,
        attendanceRecords,
        statusCounts,
        courseStats,
        totalClasses: attendanceRecords.length,
        totalRemaining,
        hasCompletedCourses
      };
    });
  }, [students, events]);

  // Sort students
  const sortedStudents = useMemo(() => {
    const sorted = [...allStudentsStats];
    
    switch (sortBy) {
      case 'remaining_asc':
        return sorted.sort((a, b) => a.totalRemaining - b.totalRemaining);
      case 'remaining_desc':
        return sorted.sort((a, b) => b.totalRemaining - a.totalRemaining);
      case 'completed':
        return sorted.sort((a, b) => {
          if (a.hasCompletedCourses && !b.hasCompletedCourses) return -1;
          if (!a.hasCompletedCourses && b.hasCompletedCourses) return 1;
          return 0;
        });
      default:
        return sorted;
    }
  }, [allStudentsStats, sortBy]);

  // Filter by search
  const filteredStudentsStats = sortedStudents.filter(s => 
    s.student.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudentStats = allStudentsStats.find(s => s.student.id === selectedStudentId);

  const isLoading = loadingStudents || loadingEvents;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">出缺席名單</h1>
        <p className="text-slate-500 mt-1">查詢學生出席記錄與剩餘堂數</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" />
              搜尋學生
            </label>
            <Input
              placeholder="輸入學生姓名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="w-full md:w-64">
            <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              排序方式
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remaining_desc">剩餘堂數：多到少</SelectItem>
                <SelectItem value="remaining_asc">剩餘堂數：少到多</SelectItem>
                <SelectItem value="completed">已完成課程優先</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* All Students List */}
          <div className="space-y-4">
            {filteredStudentsStats.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">找不到學生</h3>
                <p className="text-slate-500">請調整搜尋條件</p>
              </div>
            ) : (
              filteredStudentsStats.map(({ student, statusCounts, courseStats, totalClasses, totalRemaining, hasCompletedCourses }) => (
                <div 
                  key={student.id}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedStudentId(student.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-indigo-600">
                          {student.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">{student.name}</h3>
                          {hasCompletedCourses && (
                            <Badge className="bg-amber-100 text-amber-700">
                              已完課
                            </Badge>
                          )}
                          {totalRemaining <= 5 && totalRemaining > 0 && (
                            <Badge className="bg-red-100 text-red-700">
                              剩餘 {totalRemaining} 堂
                            </Badge>
                          )}
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-green-600">出席</p>
                            <p className="text-lg font-bold text-green-700">{statusCounts.present}</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-amber-600">請假</p>
                            <p className="text-lg font-bold text-amber-700">{statusCounts.excused}</p>
                          </div>
                          <div className="bg-red-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-red-600">缺席</p>
                            <p className="text-lg font-bold text-red-700">{statusCounts.absent}</p>
                          </div>
                          <div className="bg-indigo-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-indigo-600">總課程</p>
                            <p className="text-lg font-bold text-indigo-700">{totalClasses}</p>
                          </div>
                        </div>

                        {/* Course Stats */}
                        {courseStats.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="flex flex-wrap gap-2">
                              {courseStats.map((course, idx) => (
                                <Badge 
                                  key={idx}
                                  variant="secondary"
                                  className={`${
                                    course.sessions_remaining <= 0 
                                      ? 'bg-slate-100 text-slate-500' 
                                      : course.sessions_remaining <= 2
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-indigo-50 text-indigo-700'
                                  }`}
                                >
                                  {course.course_name}: 剩 {course.sessions_remaining}/{course.total_purchased} 堂
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected Student Detail Modal */}
          {selectedStudentId && selectedStudentStats && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedStudentId('')}>
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
                  <h2 className="text-xl font-bold text-slate-900">學生詳細資料</h2>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedStudentId('')}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Student Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-indigo-600">
                        {selectedStudentStats.student.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-900">{selectedStudentStats.student.name}</h2>
                      {selectedStudentStats.student.phone && (
                        <p className="text-slate-500 mt-1">{selectedStudentStats.student.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-slate-500">總出席</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {selectedStudentStats.statusCounts.present}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-slate-500">請假次數</p>
                      <p className="text-2xl font-bold text-amber-600 mt-1">
                        {selectedStudentStats.statusCounts.excused}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-slate-500">缺席次數</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {selectedStudentStats.statusCounts.absent}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-slate-500">總課程</p>
                      <p className="text-2xl font-bold text-indigo-600 mt-1">
                        {selectedStudentStats.totalClasses}
                      </p>
                    </div>
                  </div>

                  {/* Course Sessions */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-slate-900">課程剩餘堂數</h3>
                    </div>

                    {selectedStudentStats.courseStats.length === 0 ? (
                      <div className="bg-slate-50 rounded-xl p-6 text-center">
                        <p className="text-slate-500">尚未購買任何課程</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedStudentStats.courseStats.map((course, idx) => (
                          <div 
                            key={idx}
                            className="bg-slate-50 rounded-xl p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium text-slate-900">{course.course_name}</span>
                              <Badge 
                                className={course.sessions_remaining <= 2 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                                }
                              >
                                剩餘 {course.sessions_remaining} 堂
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span>已購: {course.total_purchased} 堂</span>
                              <span>已上: {course.sessions_used} 堂</span>
                            </div>
                            <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  course.sessions_remaining <= 2 ? 'bg-red-500' : 'bg-indigo-500'
                                }`}
                                style={{ 
                                  width: `${Math.min((course.sessions_used / course.total_purchased) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Attendance History */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-slate-900">出缺席記錄</h3>
                    </div>

                    {selectedStudentStats.attendanceRecords.length === 0 ? (
                      <div className="bg-slate-50 rounded-xl p-6 text-center">
                        <p className="text-slate-500">尚無出缺席記錄</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedStudentStats.attendanceRecords.map((record, idx) => {
                          const config = statusConfig[record.status];
                          const StatusIcon = config.icon;

                          return (
                            <div 
                              key={idx}
                              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: record.event.course_color || '#4F46E5' }}
                                />
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {record.event.course_name}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {format(record.date, 'yyyy/MM/dd EEEE HH:mm', { locale: zhTW })}
                                  </p>
                                </div>
                              </div>
                              <Badge className={`${config.color} flex items-center gap-1`}>
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}