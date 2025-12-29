import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function AddEventModal({ 
  open, 
  onOpenChange, 
  onSave, 
  isLoading, 
  courses = [], 
  students = [],
  initialDate 
}) {
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [note, setNote] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  React.useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);

  const selectedCourse = courses.find(c => c.id === courseId);

  const toggleStudent = (student) => {
    if (selectedStudents.some(s => s.student_id === student.id)) {
      setSelectedStudents(selectedStudents.filter(s => s.student_id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, {
        student_id: student.id,
        student_name: student.name,
        status: 'pending'
      }]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!courseId || !date || !time) return;

    const dateTime = new Date(`${date}T${time}`).toISOString();
    
    onSave({
      course_id: courseId,
      course_name: selectedCourse?.name || '',
      course_color: selectedCourse?.color_hex || '#4F46E5',
      date_time: dateTime,
      note: note.trim(),
      attendees: selectedStudents,
    });
  };

  const handleClose = () => {
    setCourseId('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime('10:00');
    setNote('');
    setSelectedStudents([]);
    onOpenChange(false);
  };

  // Filter students who have enrolled in the selected course
  const eligibleStudents = students.filter(student => 
    student.enrollments?.some(e => e.course_id === courseId)
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">新增課程排程</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Course Selection */}
          <div className="space-y-2">
            <Label>選擇課程 *</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="請選擇課程" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: course.color_hex || '#4F46E5' }}
                      />
                      {course.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                日期 *
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                時間 *
              </Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>備註</Label>
            <Textarea
              placeholder="課程備註..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          {/* Student Selection */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Users className="w-4 h-4" />
              選擇出席學生
            </Label>
            
            {!courseId ? (
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <p className="text-sm text-slate-500">請先選擇課程</p>
              </div>
            ) : eligibleStudents.length === 0 ? (
              <div className="bg-amber-50 rounded-xl p-6 text-center">
                <p className="text-sm text-amber-700">
                  目前沒有學生購買此課程
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {eligibleStudents.map(student => {
                  const isSelected = selectedStudents.some(s => s.student_id === student.id);
                  const enrollment = student.enrollments?.find(e => e.course_id === courseId);
                  
                  return (
                    <div
                      key={student.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleStudent(student);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-indigo-50 border-2 border-indigo-200' 
                          : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleStudent(student)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="font-medium text-slate-900">{student.name}</span>
                      </div>
                      {enrollment && (
                        <span className="text-xs text-slate-500">
                          已購 {enrollment.total_purchased} 堂
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-11"
              onClick={handleClose}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700"
              disabled={!courseId || !date || !time || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  儲存中...
                </>
              ) : '建立排程'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}