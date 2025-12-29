import React from 'react';
import { User, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StudentCard({ student, onClick }) {
  const enrollmentCount = student.enrollments?.length || 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {student.name}
            </h3>
            {enrollmentCount > 0 && (
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50">
                {enrollmentCount} 課程
              </Badge>
            )}
          </div>
          <div className="mt-2 space-y-1">
            {student.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Phone className="w-3.5 h-3.5" />
                <span>{student.phone}</span>
              </div>
            )}
            {student.email && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{student.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}