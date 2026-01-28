
## Plan: Add Download/Upload Action Buttons for IFR, IFA, IFB Documents

### Overview
This plan implements a file download/upload system for each document tracking row (IFR, IFA, IFB), allowing users to attach files to specific categories and track upload/download activity with logs.

---

### Database Design

A new table `document_files` will be created to store uploaded files linked to monitoring data entries, along with a `document_file_logs` table to track download/upload activity.

```sql
-- Table for storing uploaded files
CREATE TABLE document_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitoring_data_id UUID NOT NULL REFERENCES prabumulih_monitoring_data(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  status_category TEXT NOT NULL CHECK (status_category IN ('IFR', 'IFA', 'IFB'))
);

-- Table for tracking download/upload logs
CREATE TABLE document_file_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_file_id UUID REFERENCES document_files(id) ON DELETE SET NULL,
  monitoring_data_id UUID NOT NULL REFERENCES prabumulih_monitoring_data(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('upload', 'download')),
  user_id UUID NOT NULL,
  user_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  status_category TEXT NOT NULL CHECK (status_category IN ('IFR', 'IFA', 'IFB'))
);

-- Enable RLS
ALTER TABLE document_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_file_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_files
CREATE POLICY "All authenticated users can view document files"
  ON document_files FOR SELECT USING (true);

CREATE POLICY "Users can upload document files"
  ON document_files FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own files or admin"
  ON document_files FOR DELETE
  USING (auth.uid() = uploaded_by OR has_role(auth.uid(), 'admin'));

-- RLS Policies for document_file_logs
CREATE POLICY "All authenticated users can view logs"
  ON document_file_logs FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert logs"
  ON document_file_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### Storage Bucket

Create a new storage bucket `document-tracking-files` (or use existing `repository-files` bucket):

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('document-tracking-files', 'document-tracking-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage bucket
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'document-tracking-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'document-tracking-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'document-tracking-files' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

### UI Component Design

#### 1. Add Action Button per Row

In the Actions column, add a new button for each IFR/IFA/IFB row:

```tsx
<Button 
  variant="ghost" 
  size="sm" 
  onClick={() => openFileDialog(item)}
  title="Download/Upload Files"
>
  <FolderOpen className="h-4 w-4" />
</Button>
```

---

#### 2. File Dialog Structure

**Pop-up Form Layout:**

```text
+------------------------------------------------------+
|  [X] Document Files - IFR                            |
|------------------------------------------------------|
|  HEADER SECTION                                      |
|  File Name: Design Document A                        |
|  Category: IFR                                       |
|  PIC: John Doe                                       |
|------------------------------------------------------|
|  ACTIVITY LOG SECTION                                |
|  Last Download: John (john@email.com) - 28/01/2026   |
|  Last Upload: Jane (jane@email.com) - 27/01/2026     |
|------------------------------------------------------|
|  FILES SECTION                                       |
|  +--------------------------------------------------+|
|  | [ ] | File Name          | Size   | Date        | |
|  |-----|--------------------| -------|-------------| |
|  | [ ] | Design_v1.pdf      | 2.5 MB | 26/01/2026  | |
|  | [ ] | Specs_draft.docx   | 1.2 MB | 25/01/2026  | |
|  | [ ] | Diagram.png        | 500 KB | 24/01/2026  | |
|  +--------------------------------------------------+|
|------------------------------------------------------|
|  FOOTER ACTIONS                                      |
|  [Select All] [Download Selected] [Upload New File]  |
+------------------------------------------------------+
```

---

#### 3. State Management

Add new states to the component:

```typescript
// File dialog states
const [fileDialogOpen, setFileDialogOpen] = useState(false);
const [fileDialogItem, setFileDialogItem] = useState<MonitoringData | null>(null);
const [documentFiles, setDocumentFiles] = useState<DocumentFile[]>([]);
const [fileLogs, setFileLogs] = useState<FileLog[]>([]);
const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
const [uploading, setUploading] = useState(false);

// Types
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
  user_name: string;
  created_at: string;
}
```

---

#### 4. Dialog Component Implementation

```tsx
<Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <FolderOpen className="h-5 w-5" />
        Document Files - {fileDialogItem?.status_category}
      </DialogTitle>
    </DialogHeader>
    
    {/* Header Info */}
    <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
      <div>
        <Label className="text-xs text-muted-foreground">File Name</Label>
        <p className="font-medium">{fileDialogItem?.file_name}</p>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Category</Label>
        <Badge>{fileDialogItem?.status_category}</Badge>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">PIC</Label>
        <p className="font-medium">{fileDialogItem?.pic || '-'}</p>
      </div>
    </div>

    {/* Activity Log */}
    <div className="p-4 bg-blue-50 rounded-lg">
      <h4 className="font-medium mb-2 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Recent Activity
      </h4>
      <div className="space-y-1 text-sm">
        {lastDownloadLog && (
          <p>Last Download: {lastDownloadLog.user_name} - {formatDate(lastDownloadLog.created_at)}</p>
        )}
        {lastUploadLog && (
          <p>Last Upload: {lastUploadLog.user_name} - {formatDate(lastUploadLog.created_at)}</p>
        )}
        {!lastDownloadLog && !lastUploadLog && (
          <p className="text-muted-foreground">No activity yet</p>
        )}
      </div>
    </div>

    {/* Files Table with Selection */}
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedFileIds.length === documentFiles.length && documentFiles.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Actions</TableHead>
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
              <TableCell className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {file.file_name}
              </TableCell>
              <TableCell>{formatFileSize(file.file_size)}</TableCell>
              <TableCell>{formatDate(file.uploaded_at)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteFile(file)}>
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
    </div>

    {/* Footer Actions */}
    <div className="flex justify-between items-center pt-4 border-t">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleSelectAll}
          disabled={documentFiles.length === 0}
        >
          {selectedFileIds.length === documentFiles.length ? 'Deselect All' : 'Select All'}
        </Button>
        <Button 
          variant="outline"
          onClick={handleDownloadSelected}
          disabled={selectedFileIds.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Selected ({selectedFileIds.length})
        </Button>
      </div>
      <div>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileUpload}
          multiple
        />
        <Button onClick={() => document.getElementById('file-upload')?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

---

### Handler Functions

```typescript
// Open file dialog for a specific item
const openFileDialog = async (item: MonitoringData) => {
  setFileDialogItem(item);
  setFileDialogOpen(true);
  await fetchDocumentFiles(item.id, item.status_category);
  await fetchFileLogs(item.id, item.status_category);
};

// Fetch files for the selected item
const fetchDocumentFiles = async (monitoringDataId: string, category: string) => {
  const { data } = await supabase
    .from('document_files')
    .select('*')
    .eq('monitoring_data_id', monitoringDataId)
    .eq('status_category', category)
    .order('uploaded_at', { ascending: false });
  setDocumentFiles(data || []);
};

// Fetch activity logs
const fetchFileLogs = async (monitoringDataId: string, category: string) => {
  const { data } = await supabase
    .from('document_file_logs')
    .select('*')
    .eq('monitoring_data_id', monitoringDataId)
    .eq('status_category', category)
    .order('created_at', { ascending: false });
  setFileLogs(data || []);
};

// Handle file upload
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || !fileDialogItem || !user) return;
  
  setUploading(true);
  for (const file of Array.from(files)) {
    const fileName = `${user.id}/${fileDialogItem.id}/${Date.now()}_${file.name}`;
    
    // Upload to storage
    await supabase.storage
      .from('document-tracking-files')
      .upload(fileName, file);
    
    // Insert record
    await supabase.from('document_files').insert({
      monitoring_data_id: fileDialogItem.id,
      file_name: file.name,
      file_path: fileName,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: user.id,
      status_category: fileDialogItem.status_category,
    });
    
    // Log activity
    await supabase.from('document_file_logs').insert({
      monitoring_data_id: fileDialogItem.id,
      action: 'upload',
      user_id: user.id,
      user_name: user.email,
      status_category: fileDialogItem.status_category,
    });
  }
  
  setUploading(false);
  await fetchDocumentFiles(fileDialogItem.id, fileDialogItem.status_category);
  await fetchFileLogs(fileDialogItem.id, fileDialogItem.status_category);
};

// Handle download with logging
const handleDownloadSelected = async () => {
  for (const fileId of selectedFileIds) {
    const file = documentFiles.find(f => f.id === fileId);
    if (!file) continue;
    
    const { data } = await supabase.storage
      .from('document-tracking-files')
      .download(file.file_path);
    
    if (data) {
      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.file_name;
      link.click();
      window.URL.revokeObjectURL(url);
      
      // Log download
      await supabase.from('document_file_logs').insert({
        document_file_id: file.id,
        monitoring_data_id: fileDialogItem!.id,
        action: 'download',
        user_id: user!.id,
        user_name: user!.email,
        status_category: fileDialogItem!.status_category,
      });
    }
  }
  
  await fetchFileLogs(fileDialogItem!.id, fileDialogItem!.status_category);
  setSelectedFileIds([]);
};

// Toggle file selection
const toggleFileSelection = (fileId: string) => {
  setSelectedFileIds(prev => 
    prev.includes(fileId) 
      ? prev.filter(id => id !== fileId)
      : [...prev, fileId]
  );
};

// Select all files
const handleSelectAll = () => {
  if (selectedFileIds.length === documentFiles.length) {
    setSelectedFileIds([]);
  } else {
    setSelectedFileIds(documentFiles.map(f => f.id));
  }
};
```

---

### Summary of Changes

| File/Location | Change |
|---------------|--------|
| Database | Create `document_files` and `document_file_logs` tables |
| Storage | Create `document-tracking-files` bucket with RLS policies |
| `Area2DocumentTracking.tsx` | Add new imports (FolderOpen, Upload, Download, Clock, Badge) |
| `Area2DocumentTracking.tsx` | Add interfaces for DocumentFile and FileLog |
| `Area2DocumentTracking.tsx` | Add state variables for file dialog management |
| `Area2DocumentTracking.tsx` | Add file dialog component with header, logs, file table, and actions |
| `Area2DocumentTracking.tsx` | Add handler functions for upload, download, and selection |
| `Area2DocumentTracking.tsx` | Add file action button in renderDataRows function |

---

### User Experience Flow

1. **User clicks file button** on any IFR/IFA/IFB row
2. **Dialog opens** showing:
   - Header: File Name, Category badge, PIC
   - Activity: Last download/upload by username with timestamp
   - Files: List with checkboxes for multi-selection
3. **To download**: User selects files with checkboxes, clicks "Download Selected"
4. **To upload**: User clicks "Upload Files", selects files from device
5. **Logs are automatically recorded** for all upload/download actions

---

### Technical Considerations

| Aspect | Implementation |
|--------|----------------|
| File Validation | Reuse existing validation logic from Repository.tsx |
| File Size Limit | 10MB per file (configurable) |
| Allowed Types | PDF, Excel, CSV, Word, Images |
| Multi-file Download | Downloads files one by one (browser limitation) |
| Activity Tracking | Stored with user email and timestamp |
| RLS Security | All authenticated users can view; users can only delete their own uploads |
