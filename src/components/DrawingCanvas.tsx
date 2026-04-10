import { useRef, useEffect, useState, useCallback } from 'react';

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  userId?: string;
  userName?: string;
}

interface DrawingCanvasProps {
  width: number;
  height: number;
  active: boolean;
  color: string;
  strokeWidth: number;
  existingStrokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  currentUserId: string;
  currentUserName: string;
}

export function DrawingCanvas({
  width,
  height,
  active,
  color,
  strokeWidth,
  existingStrokes,
  onStrokesChange,
  currentUserId,
  currentUserName,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw all existing strokes
    for (const stroke of existingStrokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(stroke.points[0].x * width, stroke.points[0].y * height);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * width, stroke.points[i].y * height);
      }
      ctx.stroke();
    }

    // Draw current stroke being drawn
    if (currentStroke.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(currentStroke[0].x * width, currentStroke[0].y * height);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x * width, currentStroke[i].y * height);
      }
      ctx.stroke();
    }
  }, [existingStrokes, currentStroke, width, height, color, strokeWidth]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / width,
      y: (e.clientY - rect.top) / height,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!active) return;
    setIsDrawing(true);
    const pos = getPos(e);
    setCurrentStroke([pos]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !active) return;
    const pos = getPos(e);
    setCurrentStroke(prev => [...prev, pos]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length >= 2) {
      const newStroke: Stroke = {
        points: currentStroke,
        color,
        width: strokeWidth,
        userId: currentUserId,
        userName: currentUserName,
      };
      onStrokesChange([...existingStrokes, newStroke]);
    }
    setCurrentStroke([]);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0"
      style={{
        cursor: active ? 'crosshair' : 'default',
        pointerEvents: active ? 'auto' : 'none',
        zIndex: active ? 10 : 5,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}

export type { Stroke };
