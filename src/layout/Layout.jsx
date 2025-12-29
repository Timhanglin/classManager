import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Calendar, 
  ClipboardList 
} from 'lucide-react';
import { cn } from '@/utils';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Overview', label: '總覽', icon: LayoutDashboard },
    { name: 'CourseManagement', label: '課程管理', icon: BookOpen },
    { name: 'StudentManagement', label: '學生管理', icon: Users },
    { name: 'CourseCalendar', label: '課程行事曆', icon: Calendar },
    { name: 'AttendanceRecords', label: '出缺席名單', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900 tracking-tight">
              課程管理系統
            </span>
          </div>
        </div>
      </nav>

      {/* Side Navigation */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 z-40 hidden lg:block">
        <div className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.name;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-indigo-50 text-indigo-600" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-50 lg:hidden">
        <div className="h-full flex items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.name;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                  isActive ? "text-indigo-600" : "text-slate-400"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label.slice(0, 4)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen pb-20 lg:pb-8">
        <div className="max-w-6xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}