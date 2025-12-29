import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Users, Trash2, Phone, Mail, BookOpen, Edit2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AddStudentModal from '@/components/students/AddStudentModal';
import EditStudentModal from '@/components/students/EditStudentModal';
import StudentDetailModal from '@/components/students/StudentDetailModal';

export default function StudentManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list('-created_date', 100),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.ScheduleEvent.list('-date_time', 500),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Student.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowAddModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Student.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setEditStudent(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Student.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setDeleteId(null);
    },
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">學生管理</h1>
          <p className="text-slate-500 mt-1">管理學生資料與課程購買</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          新增學生
        </Button>
      </div>

      {/* Student List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">尚未建立任何學生</h3>
            <p className="text-slate-500 mb-6">點擊上方按鈕開始建立第一位學生</p>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              新增學生
            </Button>
          </div>
        ) : (
          students.map(student => (
            <div 
              key={student.id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-indigo-600">
                      {student.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900">{student.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      {student.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Phone className="w-4 h-4" />
                          {student.phone}
                        </div>
                      )}
                      {student.email && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Mail className="w-4 h-4" />
                          {student.email}
                        </div>
                      )}
                    </div>
                    {student.note && (
                      <p className="text-sm text-slate-500 mt-2">{student.note}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
                    onClick={() => setViewStudent(student)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    查看詳情
                  </Button>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() => setEditStudent(student)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteId(student.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Enrollments */}
              {student.enrollments && student.enrollments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">已購買課程</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {student.enrollments.map((enrollment, idx) => (
                      <Badge 
                        key={idx}
                        variant="secondary"
                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5"
                      >
                        {enrollment.course_name} · {enrollment.total_purchased} 堂
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
        courses={courses}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        open={!!editStudent}
        onOpenChange={() => setEditStudent(null)}
        onSave={(data) => updateMutation.mutate({ id: editStudent.id, data })}
        isLoading={updateMutation.isPending}
        student={editStudent}
        courses={courses}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        open={!!viewStudent}
        onOpenChange={() => setViewStudent(null)}
        student={viewStudent}
        events={events}
        courses={courses}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除此學生？</AlertDialogTitle>
            <AlertDialogDescription>
              此動作無法復原。刪除後該學生的所有課程購買記錄也會一併刪除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              確定刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}