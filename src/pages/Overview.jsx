import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/ui/StatCard';
import CourseCard from '@/components/courses/CourseCard';
import StudentCard from '@/components/students/StudentCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Overview() {
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list('-created_date', 50),
  });

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 50),
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.ScheduleEvent.list('-date_time', 100),
  });

  const isLoading = loadingStudents || loadingCourses || loadingEvents;

  // Calculate total sessions this month
  const thisMonth = new Date();
  const monthEvents = events.filter(e => {
    const eventDate = new Date(e.date_time);
    return eventDate.getMonth() === thisMonth.getMonth() && 
           eventDate.getFullYear() === thisMonth.getFullYear();
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">總覽</h1>
        <p className="text-slate-500 mt-1">課程管理系統儀表板</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard 
              title="學生人數" 
              value={students.length} 
              icon={Users} 
              color="indigo" 
            />
            <StatCard 
              title="課程數量" 
              value={courses.length} 
              icon={BookOpen} 
              color="emerald" 
            />
            <StatCard 
              title="本月課程" 
              value={monthEvents.length} 
              icon={Calendar} 
              color="amber" 
            />
            <StatCard 
              title="總課程堂數" 
              value={events.length} 
              icon={TrendingUp} 
              color="rose" 
            />
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">課程列表</h2>
            <Link 
              to={createPageUrl('CourseManagement')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              查看全部
            </Link>
          </div>
          <div className="space-y-3">
            {loadingCourses ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))
            ) : courses.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-8 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">尚未建立任何課程</p>
              </div>
            ) : (
              courses.slice(0, 5).map(course => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>
        </div>

        {/* Students Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">學生列表</h2>
            <Link 
              to={createPageUrl('StudentManagement')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              查看全部
            </Link>
          </div>
          <div className="space-y-3">
            {loadingStudents ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))
            ) : students.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-8 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">尚未建立任何學生</p>
              </div>
            ) : (
              students.slice(0, 5).map(student => (
                <StudentCard key={student.id} student={student} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}