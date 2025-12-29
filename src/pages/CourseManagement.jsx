import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, BookOpen, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import AddCourseModal from '@/components/courses/AddCourseModal';
import EditCourseModal from '@/components/courses/EditCourseModal';

export default function CourseManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowAddModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setEditCourse(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setDeleteId(null);
    },
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">課程管理</h1>
          <p className="text-slate-500 mt-1">建立與管理所有課程</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          新增課程
        </Button>
      </div>

      {/* Course List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))
        ) : courses.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">尚未建立任何課程</h3>
            <p className="text-slate-500 mb-6">點擊上方按鈕開始建立第一個課程</p>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              新增課程
            </Button>
          </div>
        ) : (
          courses.map(course => (
            <div 
              key={course.id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${course.color_hex || '#4F46E5'}15` }}
                >
                  <BookOpen 
                    className="w-6 h-6" 
                    style={{ color: course.color_hex || '#4F46E5' }}
                  />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    onClick={() => setEditCourse(course)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteId(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-lg text-slate-900">{course.name}</h3>
                {course.description && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {course.description}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${course.color_hex || '#4F46E5'}15`,
                    color: course.color_hex || '#4F46E5'
                  }}
                >
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: course.color_hex || '#4F46E5' }}
                  />
                  行事曆顏色
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Course Modal */}
      <AddCourseModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Edit Course Modal */}
      <EditCourseModal
        open={!!editCourse}
        onOpenChange={() => setEditCourse(null)}
        onSave={(data) => updateMutation.mutate({ id: editCourse.id, data })}
        isLoading={updateMutation.isPending}
        course={editCourse}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除此課程？</AlertDialogTitle>
            <AlertDialogDescription>
              此動作無法復原。刪除後所有相關的排課記錄也可能受到影響。
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