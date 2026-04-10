import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export interface Comment {
  id?: string;
  x: number;
  y: number;
  text: string;
  userId: string;
  userName: string;
  createdAt?: string;
}

interface TextAnnotationProps {
  comments: Comment[];
  containerWidth: number;
  containerHeight: number;
  active: boolean;
  currentUserId: string;
  currentUserName: string;
  onAddComment: (comment: Comment) => void;
  onDeleteComment: (index: number) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function TextAnnotation({
  comments,
  containerWidth,
  containerHeight,
  active,
  currentUserId,
  currentUserName,
  onAddComment,
  onDeleteComment,
  onClick,
}: TextAnnotationProps) {
  const [pendingPos, setPendingPos] = useState<{ x: number; y: number } | null>(null);
  const [newText, setNewText] = useState('');

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!active) return;
    onClick?.(e);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / containerWidth;
    const y = (e.clientY - rect.top) / containerHeight;
    setPendingPos({ x, y });
    setNewText('');
  };

  const handleSubmit = () => {
    if (!pendingPos || !newText.trim()) return;
    onAddComment({
      x: pendingPos.x,
      y: pendingPos.y,
      text: newText.trim(),
      userId: currentUserId,
      userName: currentUserName,
    });
    setPendingPos(null);
    setNewText('');
  };

  return (
    <div
      className="absolute top-0 left-0 w-full h-full"
      style={{
        pointerEvents: active ? 'auto' : 'none',
        zIndex: active ? 10 : 5,
        cursor: active ? 'cell' : 'default',
      }}
      onClick={handleClick}
    >
      {comments.map((comment, idx) => (
        <Popover key={comment.id || idx}>
          <PopoverTrigger asChild>
            <button
              className="absolute flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md hover:scale-110 transition-transform"
              style={{
                left: `${comment.x * 100}%`,
                top: `${comment.y * 100}%`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                zIndex: 15,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <MessageSquare className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 z-50" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">{comment.userName}</p>
                {comment.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt), 'dd/MM HH:mm')}
                  </p>
                )}
              </div>
              <p className="text-sm">{comment.text}</p>
              {comment.userId === currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive"
                  onClick={() => onDeleteComment(idx)}
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      ))}

      {pendingPos && (
        <div
          className="absolute z-20 bg-background border rounded-lg p-3 shadow-lg w-56"
          style={{
            left: `${pendingPos.x * 100}%`,
            top: `${pendingPos.y * 100}%`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Textarea
            placeholder="Add a comment..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="text-sm min-h-[60px] mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={handleSubmit}>
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => setPendingPos(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
