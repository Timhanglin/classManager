import React, { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

const colorOptions = [
  '#4F46E5', '#7C3AED', '#EC4899', '#EF4444', 
  '#F59E0B', '#10B981', '#06B6D4', '#3B82F6'
];

export default function EditCourseModal({ open, onOpenChange, onSave, isLoading, course }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorHex, setColorHex] = useState('#4F46E5');

  useEffect(() => {
    if (course) {
      setName(course.name || '');
      setDescription(course.description || '');
      setColorHex(course.color_hex || '#4F46E5');
    }
  }, [course]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      description: description.trim(),
      color_hex: colorHex,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">編輯課程</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">課程名稱 *</Label>
            <Input
              id="name"
              placeholder="例如：鋼琴課"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">課程備註</Label>
            <Textarea
              id="description"
              placeholder="課程說明或備註..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>行事曆顏色</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColorHex(color)}
                  className={`w-9 h-9 rounded-full transition-all duration-200 ${
                    colorHex === color 
                      ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
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
              ) : '儲存修改'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}