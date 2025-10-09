import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Database, Upload, Search, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Repository = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchUserRole();
    fetchFiles();
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setUserRole(data.role);
    }
  };

  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch files',
        variant: 'destructive',
      });
      return;
    }

    setFiles(data || []);
  };

  const handleUpload = async () => {
    if (!uploadFile || !user) return;

    setUploading(true);

    try {
      // In a real app, you would upload to Supabase Storage
      // For now, we'll just store metadata
      const { error } = await supabase.from('files').insert({
        file_name: uploadFile.name,
        file_path: `/uploads/${uploadFile.name}`,
        file_type: uploadFile.type,
        uploaded_by: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });

      setUploadFile(null);
      fetchFiles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReview = async (fileId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('files')
        .update({
          review_status: 'reviewed',
          review_notes: reviewNotes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'File marked as reviewed',
      });

      setReviewNotes('');
      setSelectedFile(null);
      fetchFiles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async (fileId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('files')
        .update({
          review_status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'File approved',
      });

      fetchFiles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'reviewed':
        return 'bg-info';
      case 'approved':
        return 'bg-success';
      default:
        return 'bg-muted';
    }
  };

  const filteredFiles = files.filter(
    (file) =>
      file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.review_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8" />
          Data Repository
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload, review, and approve data files
        </p>
      </div>

      {userRole === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload File
            </CardTitle>
            <CardDescription>Upload new files to the repository</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button onClick={handleUpload} disabled={!uploadFile || uploading}>
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>View and manage uploaded files</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p>No files found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">{file.file_name}</TableCell>
                      <TableCell>
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(file.review_status)}>
                          {file.review_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {userRole === 'reviewer' && file.review_status === 'pending' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedFile(file)}
                              >
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review File</DialogTitle>
                                <DialogDescription>
                                  Add your review notes for {file.file_name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="notes">Review Notes</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Enter your review notes..."
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    rows={4}
                                  />
                                </div>
                                <Button
                                  onClick={() => handleReview(file.id)}
                                  className="w-full"
                                >
                                  Submit Review
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        {userRole === 'approver' && file.review_status === 'reviewed' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(file.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Repository;
