import React from 'react';
import { BookOpen } from 'lucide-react';

export default function CourseCard({ course, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${course.color_hex || '#4F46E5'}20` }}
        >
          <BookOpen 
            className="w-6 h-6" 
            style={{ color: course.color_hex || '#4F46E5' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {course.name}
          </h3>
          {course.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
              {course.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}