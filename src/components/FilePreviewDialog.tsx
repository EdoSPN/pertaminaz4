import { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DrawingCanvas, type Stroke } from '@/components/DrawingCanvas';
import { TextAnnotation, type Comment } from '@/components/TextAnnotation';
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  MessageSquare,
  Undo2,
  Save,
  Loader2,
  Eraser,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
}

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: DocumentFile | null;
  userId: string;
  userEmail: string;
}

type ToolMode = 'none' | 'draw' | 'comment';

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#000000'];

export function FilePreviewDialog({
  open,
  onOpenChange,
  file,
  userId,
  userEmail,
}: FilePreviewDialogProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [toolMode, setToolMode] = useState<ToolMode>('none');
  const [drawColor, setDrawColor] = useState('#ef4444');
  const [strokeWidth] = useState(3);
  const [pageWidth, setPageWidth] = useState(700);
  const [pageHeight, setPageHeight] = useState(900);

  // Per-page annotation state
  const [drawingsByPage, setDrawingsByPage] = useState<Record<number, Stroke[]>>({});
  const [commentsByPage, setCommentsByPage] = useState<Record<number, Comment[]>>({});
  const [saving, setSaving] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOfficeFile = useCallback((fileName: string) => {
    return /\.(docx?|xlsx?|pptx?)$/i.test(fileName);
  }, []);

  const isImageFile = useCallback((fileName: string) => {
    return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(fileName);
  }, []);

  const isPdfFile = useCallback((fileName: string) => {
    return /\.pdf$/i.test(fileName);
  }, []);

  // Load file URL
  useEffect(() => {
    if (!open || !file) return;
    setLoading(true);
    setCurrentPage(1);
    setDrawingsByPage({});
    setCommentsByPage({});
    setToolMode('none');

    const loadFile = async () => {
      if (isImageFile(file.file_name)) {
        setIsImage(true);
        setIsPdf(false);
        const { data } = await supabase.storage
          .from('document-tracking-files')
          .createSignedUrl(file.file_path, 3600);
        setFileUrl(data?.signedUrl || null);
        setNumPages(1);
        setLoading(false);
      } else if (isPdfFile(file.file_name)) {
        setIsImage(false);
        setIsPdf(true);
        const { data } = await supabase.storage
          .from('document-tracking-files')
          .createSignedUrl(file.file_path, 3600);
        setFileUrl(data?.signedUrl || null);
        setLoading(false);
      } else if (isOfficeFile(file.file_name)) {
        setIsImage(false);
        setIsPdf(true);
        setConverting(true);
        try {
          const { data, error } = await supabase.functions.invoke('convert-to-pdf', {
            body: { filePath: file.file_path, bucketName: 'document-tracking-files' },
          });
          if (error || !data?.convertedPath) {
            toast.error('Failed to convert document for preview');
            setFileUrl(null);
          } else {
            const { data: urlData } = await supabase.storage
              .from('document-tracking-files')
              .createSignedUrl(data.convertedPath, 3600);
            setFileUrl(urlData?.signedUrl || null);
          }
        } catch {
          toast.error('Failed to convert document');
        }
        setConverting(false);
        setLoading(false);
      } else {
        toast.error('Unsupported file type for preview');
        setLoading(false);
      }
    };

    loadFile();
    loadAnnotations();
  }, [open, file]);

  const loadAnnotations = async () => {
    if (!file) return;
    const { data, error } = await supabase
      .from('file_annotations')
      .select('*')
      .eq('document_file_id', file.id)
      .order('created_at', { ascending: true });

    if (error || !data) return;

    const drawings: Record<number, Stroke[]> = {};
    const comments: Record<number, Comment[]> = {};

    for (const ann of data) {
      const pg = ann.page_number;
      const d = ann.data as Record<string, unknown>;
      if (ann.annotation_type === 'drawing') {
        if (!drawings[pg]) drawings[pg] = [];
        const strokes = (d.strokes as Stroke[]) || [];
        drawings[pg].push(...strokes);
      } else if (ann.annotation_type === 'comment') {
        if (!comments[pg]) comments[pg] = [];
        comments[pg].push({
          id: ann.id,
          x: d.x as number,
          y: d.y as number,
          text: d.text as string,
          userId: ann.created_by,
          userName: ann.created_by_name || 'Unknown',
          createdAt: ann.created_at,
        });
      }
    }

    setDrawingsByPage(drawings);
    setCommentsByPage(comments);
  };

  const handleSaveDrawings = async () => {
    if (!file) return;
    setSaving(true);

    try {
      // Delete existing drawing annotations by this user for this file
      await supabase
        .from('file_annotations')
        .delete()
        .eq('document_file_id', file.id)
        .eq('annotation_type', 'drawing')
        .eq('created_by', userId);

      // Save current drawings per page
      const inserts = [];
      for (const [page, strokes] of Object.entries(drawingsByPage)) {
        const myStrokes = strokes.filter((s) => s.userId === userId);
        if (myStrokes.length === 0) continue;
        inserts.push({
          document_file_id: file.id,
          page_number: parseInt(page),
          annotation_type: 'drawing',
          data: { strokes: myStrokes },
          created_by: userId,
          created_by_name: userEmail,
        });
      }

      if (inserts.length > 0) {
        const { error } = await supabase.from('file_annotations').insert(inserts);
        if (error) throw error;
      }

      toast.success('Drawings saved');
    } catch {
      toast.error('Failed to save drawings');
    }
    setSaving(false);
  };

  const handleAddComment = async (comment: Comment) => {
    if (!file) return;
    const { data, error } = await supabase
      .from('file_annotations')
      .insert({
        document_file_id: file.id,
        page_number: currentPage,
        annotation_type: 'comment',
        data: { x: comment.x, y: comment.y, text: comment.text },
        created_by: userId,
        created_by_name: userEmail,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add comment');
      return;
    }

    setCommentsByPage((prev) => ({
      ...prev,
      [currentPage]: [
        ...(prev[currentPage] || []),
        {
          ...comment,
          id: data.id,
          createdAt: data.created_at,
        },
      ],
    }));
  };

  const handleDeleteComment = async (index: number) => {
    const pageComments = commentsByPage[currentPage] || [];
    const comment = pageComments[index];
    if (!comment?.id) return;

    const { error } = await supabase
      .from('file_annotations')
      .delete()
      .eq('id', comment.id);

    if (error) {
      toast.error('Failed to delete comment');
      return;
    }

    setCommentsByPage((prev) => ({
      ...prev,
      [currentPage]: pageComments.filter((_, i) => i !== index),
    }));
  };

  const handleUndo = () => {
    const strokes = drawingsByPage[currentPage] || [];
    // Find last stroke by current user
    for (let i = strokes.length - 1; i >= 0; i--) {
      if (strokes[i].userId === userId) {
        setDrawingsByPage((prev) => ({
          ...prev,
          [currentPage]: strokes.filter((_, idx) => idx !== i),
        }));
        return;
      }
    }
  };

  const handleClearMyDrawings = () => {
    const strokes = drawingsByPage[currentPage] || [];
    setDrawingsByPage((prev) => ({
      ...prev,
      [currentPage]: strokes.filter((s) => s.userId !== userId),
    }));
  };

  const onDocumentLoadSuccess = ({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
  };

  const onPageLoadSuccess = ({ width, height }: { width: number; height: number }) => {
    // Scale to fit container
    const maxW = Math.min(700, (containerRef.current?.clientWidth || 700) - 40);
    const scale = maxW / width;
    setPageWidth(maxW);
    setPageHeight(height * scale);
  };

  const currentStrokes = drawingsByPage[currentPage] || [];
  const currentComments = commentsByPage[currentPage] || [];

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b bg-muted/50 flex-wrap">
          <span className="text-sm font-medium truncate max-w-[200px]">{file.file_name}</span>
          <div className="flex-1" />

          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={toolMode === 'draw' ? 'default' : 'ghost'}
              size="sm"
              className="h-7"
              onClick={() => setToolMode(toolMode === 'draw' ? 'none' : 'draw')}
            >
              <Pencil className="h-3.5 w-3.5 mr-1" /> Draw
            </Button>
            <Button
              variant={toolMode === 'comment' ? 'default' : 'ghost'}
              size="sm"
              className="h-7"
              onClick={() => setToolMode(toolMode === 'comment' ? 'none' : 'comment')}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" /> Comment
            </Button>
          </div>

          {toolMode === 'draw' && (
            <>
              <div className="flex items-center gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    className="w-5 h-5 rounded-full border-2 transition-transform"
                    style={{
                      backgroundColor: c,
                      borderColor: c === drawColor ? 'hsl(var(--foreground))' : 'transparent',
                      transform: c === drawColor ? 'scale(1.2)' : 'scale(1)',
                    }}
                    onClick={() => setDrawColor(c)}
                  />
                ))}
              </div>
              <Button variant="ghost" size="sm" className="h-7" onClick={handleUndo}>
                <Undo2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7" onClick={handleClearMyDrawings}>
                <Eraser className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                onClick={handleSaveDrawings}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                Save
              </Button>
            </>
          )}

          {numPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs min-w-[50px] text-center">
                {currentPage} / {numPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div ref={containerRef} className="flex-1 overflow-auto flex items-start justify-center p-4 bg-muted/30">
          {(loading || converting) ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {converting ? 'Converting document...' : 'Loading file...'}
              </p>
            </div>
          ) : !fileUrl ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Unable to load file preview</p>
            </div>
          ) : (
            <div className="relative inline-block" style={{ width: pageWidth, height: pageHeight }}>
              {isPdf && (
                <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} loading={null}>
                  <Page
                    pageNumber={currentPage}
                    width={pageWidth}
                    onLoadSuccess={onPageLoadSuccess}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              )}
              {isImage && (
                <img
                  src={fileUrl}
                  alt={file.file_name}
                  className="w-full h-auto"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    const maxW = Math.min(700, (containerRef.current?.clientWidth || 700) - 40);
                    const scale = maxW / img.naturalWidth;
                    setPageWidth(maxW);
                    setPageHeight(img.naturalHeight * scale);
                  }}
                  style={{ width: pageWidth }}
                />
              )}

              {/* Drawing overlay */}
              <DrawingCanvas
                width={pageWidth}
                height={pageHeight}
                active={toolMode === 'draw'}
                color={drawColor}
                strokeWidth={strokeWidth}
                existingStrokes={currentStrokes}
                onStrokesChange={(strokes) =>
                  setDrawingsByPage((prev) => ({ ...prev, [currentPage]: strokes }))
                }
                currentUserId={userId}
                currentUserName={userEmail}
              />

              {/* Comment overlay */}
              <TextAnnotation
                comments={currentComments}
                containerWidth={pageWidth}
                containerHeight={pageHeight}
                active={toolMode === 'comment'}
                currentUserId={userId}
                currentUserName={userEmail}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
