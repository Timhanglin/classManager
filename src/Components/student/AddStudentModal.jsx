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
import { Loader2, Plus, X, BookOpen } from 'lucide-react';

export default function AddStudentModal({ open, onOpenChange, onSave, isLoading, courses = [] }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [enrollments, setEnrollments] = useState([]);

  const addEnrollment = () => {
    setEnrollments([...enrollments, { course_id: '', course_name: '', total_purchased: 1 }]);
  };

  const updateEnrollment = (index, field, value) => {
    const updated = [...enrollments];
    if (field === 'course_id') {
      const course = courses.find(c => c.id === value);
      updated[index] = {
        ...updated[index],
        course_id: value,
        course_name: course?.name || '',
      };
    } else {
      updated[index][field] = value;
    }
    setEnrollments(updated);
  };

  const removeEnrollment = (index) => {
    setEnrollments(enrollments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const validEnrollments = enrollments.filter(e => e.course_id && e.total_purchased > 0);
    
    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      note: note.trim(),
      enrollments: validEnrollments,
    });
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    setNote('');
    setEnrollments([]);
    onOpenChange(false);
  };

  const availableCourses = courses.filter(
    c => !enrollments.some(e => e.course_id === c.id)
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">新增學生</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">學生姓名 *</Label>
              <Input
                id="name"
                placeholder="請輸入姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">電話號碼</Label>
                <Input
                  id="phone"
                  placeholder="0912-345-678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">電子郵件</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">備註</Label>
              <Textarea
                id="note"
                placeholder="學生相關備註..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Course Enrollments */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">購買課程堂數</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEnrollment}
                disabled={availableCourses.length === 0}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                新增課程
              </Button>
            </div>

            {enrollments.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">尚未新增任何課程</p>
                <p className="text-xs text-slate-400 mt-1">點擊上方按鈕新增購買的課程堂數</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enrollment, index) => (
                  <div 
                    key={index}
                    className="bg-slate-50 rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <Select
                        value={enrollment.course_id}
                        onValueChange={(value) => updateEnrollment(index, 'course_id', value)}
                      >
                        <SelectTrigger className="h-10 bg-white">
                          <SelectValue placeholder="選擇課程" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses
                            .filter(c => c.id === enrollment.course_id || !enrollments.some(e => e.course_id === c.id))
                            .map(course => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        placeholder="堂數"
                        value={enrollment.total_purchased}
                        onChange={(e) => updateEnrollment(index, 'total_purchased', parseInt(e.target.value) || 0)}
                        className="h-10 bg-white text-center"
                      />
                    </div>
                    <span className="text-sm text-slate-500">堂</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEnrollment(index)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
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
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  儲存中...
                </>
              ) : '新增學生'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}