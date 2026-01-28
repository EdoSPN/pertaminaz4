import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FolderOpen, Upload, Download, Clock, FileText, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MonitoringData {
  id: string;
  file_name: string;
  status_category: 'IFR' | 'IFA' | 'IFB';
  pic: string | null;
}

interface DocumentFile {
  id: string;
  monitoring_data_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string;
  uploaded_at: string;
  status_category: string;
}

interface FileLog {
  id: string;
  action: 'upload' | 'download';
  user_name: string | null;
  created_at: string;
}

interface DocumentFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MonitoringData | null;
  userId: string;
  userEmail: string;
}

export function DocumentFilesDialog({ 
  open, 
  onOpenChange, 
  item, 
  userId, 
  userEmail 
}: DocumentFilesDialogProps) {
  const [documentFiles, setDocumentFiles] = useState<DocumentFile[]>([]);
  const [fileLogs, setFileLogs] = useState<FileLog[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && item) {
      fetchDocumentFiles();
      fetchFileLogs();
    }
    // Reset selection when dialog closes
    if (!open) {
      setSelectedFileIds([]);
    }
  }, [open, item]);

  const fetchDocumentFiles = async () => {
    if (!item) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('document_files')
      .select('*')
      .eq('monitoring_data_id', item.id)
      .eq('status_category', item.status_category)
      .order('uploaded_at', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch files:', error);
    } else {
      setDocumentFiles(data || []);
    }
    setLoading(false);
  };

  const fetchFileLogs = async () => {
    if (!item) return;
    const { data, error } = await supabase
      .from('document_file_logs')
      .select('*')
      .eq('monitoring_data_id', item.id)
      .eq('status_category', item.status_category)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error && data) {
      const typedLogs: FileLog[] = data.map(log => ({
        id: log.id,
        action: log.action as 'upload' | 'download',
        user_name: log.user_name,
        created_at: log.created_at,
      }));
      setFileLogs(typedLogs);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !item || !userId) return;
    
    setUploading(true);
    let uploadedCount = 0;
    
    for (const file of Array.from(files)) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        continue;
      }

      const filePath = `${userId}/${item.id}/${Date.now()}_${file.name}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('document-tracking-files')
        .upload(filePath, file);
      
      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }
      
      // Insert record
      const { error: insertError } = await supabase.from('document_files').insert({
        monitoring_data_id: item.id,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: userId,
        status_category: item.status_category,
      });
      
      if (insertError) {
        toast.error(`Failed to save ${file.name} record`);
        continue;
      }
      
      // Log activity
      await supabase.from('document_file_logs').insert({
        monitoring_data_id: item.id,
        action: 'upload',
        user_id: userId,
        user_name: userEmail,
        status_category: item.status_category,
      });
      
      uploadedCount++;
    }
    
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (uploadedCount > 0) {
      toast.success(`${uploadedCount} file(s) uploaded successfully`);
      fetchDocumentFiles();
      fetchFileLogs();
    }
  };

  const handleDownloadSelected = async () => {
    if (!item || !userId) return;
    
    setDownloading(true);
    
    for (const fileId of selectedFileIds) {
      const file = documentFiles.find(f => f.id === fileId);
      if (!file) continue;
      
      const { data, error } = await supabase.storage
        .from('document-tracking-files')
        .download(file.file_path);
      
      if (error || !data) {
        toast.error(`Failed to download ${file.file_name}`);
        continue;
      }
      
      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Log download
      await supabase.from('document_file_logs').insert({
        document_file_id: file.id,
        monitoring_data_id: item.id,
        action: 'download',
        user_id: userId,
        user_name: userEmail,
        status_category: item.status_category,
      });
    }
    
    setDownloading(false);
    toast.success('Download completed');
    fetchFileLogs();
    setSelectedFileIds([]);
  };

  const handleDeleteFile = async (file: DocumentFile) => {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('document-tracking-files')
      .remove([file.file_path]);
    
    if (storageError) {
      toast.error('Failed to delete file from storage');
      return;
    }
    
    // Delete record
    const { error: dbError } = await supabase
      .from('document_files')
      .delete()
      .eq('id', file.id);
    
    if (dbError) {
      toast.error('Failed to delete file record');
      return;
    }
    
    toast.success('File deleted successfully');
    fetchDocumentFiles();
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFileIds.length === documentFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(documentFiles.map(f => f.id));
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm');
  };

  const lastDownloadLog = fileLogs.find(log => log.action === 'download');
  const lastUploadLog = fileLogs.find(log => log.action === 'upload');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'IFR': return 'bg-blue-100 text-blue-800';
      case 'IFA': return 'bg-purple-100 text-purple-800';
      case 'IFB': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Document Files - {item?.status_category}
          </DialogTitle>
        </DialogHeader>
        
        {/* Header Info */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <Label className="text-xs text-muted-foreground">File Name</Label>
            <p className="font-medium text-sm">{item?.file_name}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Badge className={getCategoryColor(item?.status_category || '')}>
              {item?.status_category}
            </Badge>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">PIC</Label>
            <p className="font-medium text-sm">{item?.pic || '-'}</p>
          </div>
        </div>

        {/* Activity Log */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            Recent Activity
          </h4>
          <div className="space-y-1 text-sm">
            {lastDownloadLog && (
              <p className="text-muted-foreground">
                <span className="font-medium">Last Download:</span> {lastDownloadLog.user_name || 'Unknown'} - {formatDate(lastDownloadLog.created_at)}
              </p>
            )}
            {lastUploadLog && (
              <p className="text-muted-foreground">
                <span className="font-medium">Last Upload:</span> {lastUploadLog.user_name || 'Unknown'} - {formatDate(lastUploadLog.created_at)}
              </p>
            )}
            {!lastDownloadLog && !lastUploadLog && (
              <p className="text-muted-foreground">No activity yet</p>
            )}
          </div>
        </div>

        {/* Files Table with Selection */}
        <div className="border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedFileIds.length === documentFiles.length && documentFiles.length > 0}
                      onCheckedChange={handleSelectAll}
                      disabled={documentFiles.length === 0}
                    />
                  </TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedFileIds.includes(file.id)}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]" title={file.file_name}>
                          {file.file_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatFileSize(file.file_size)}</TableCell>
                    <TableCell className="text-sm">{formatDate(file.uploaded_at)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteFile(file)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {documentFiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No files uploaded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
              disabled={documentFiles.length === 0}
            >
              {selectedFileIds.length === documentFiles.length && documentFiles.length > 0 ? 'Deselect All' : 'Select All'}
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleDownloadSelected}
              disabled={selectedFileIds.length === 0 || downloading}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download ({selectedFileIds.length})
            </Button>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload-dialog"
              className="hidden"
              onChange={handleFileUpload}
              multiple
            />
            <Button 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload Files
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
