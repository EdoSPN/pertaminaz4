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
import { Database, Upload, Search, FileText, Trash2, Edit, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  
  // Upload dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileSubject, setFileSubject] = useState('');
  
  // Comment dialog states
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [selectedFileForComment, setSelectedFileForComment] = useState<any>(null);
  
  // Replace dialog states
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [fileToReplace, setFileToReplace] = useState<File | null>(null);
  const [fileToReplaceId, setFileToReplaceId] = useState<string>('');

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

  const handleUploadSubmit = async () => {
    if (!fileToUpload || !fileSubject.trim() || !user) {
      toast({
        title: 'Error',
        description: 'Please provide both a file and subject',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase.from('files').insert({
        file_name: fileSubject,
        file_path: `/uploads/${fileToUpload.name}`,
        file_type: fileToUpload.type,
        uploaded_by: user.id,
        review_status: 'pending',
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });

      setUploadDialogOpen(false);
      setFileToUpload(null);
      setFileSubject('');
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

  const handleDelete = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'File deleted successfully',
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

  const handleReplaceSubmit = async () => {
    if (!fileToReplace || !fileToReplaceId || !user) {
      toast({
        title: 'Error',
        description: 'Please select a file to replace',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase
        .from('files')
        .update({
          file_path: `/uploads/${fileToReplace.name}`,
          file_type: fileToReplace.type,
          uploaded_at: new Date().toISOString(),
        })
        .eq('id', fileToReplaceId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'File replaced successfully',
      });
      setReplaceDialogOpen(false);
      setFileToReplace(null);
      setFileToReplaceId('');
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
        description: 'File approved successfully',
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

  const fetchComments = async (fileId: string) => {
    try {
      const { data, error } = await supabase
        .from('file_comments')
        .select('*')
        .eq('file_id', fileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedFileForComment || !user) {
      toast({
        title: 'Error',
        description: 'Please enter a comment',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('file_comments')
        .insert([
          {
            file_id: selectedFileForComment.id,
            user_id: user.id,
            comment: comment,
          },
        ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
      setComment('');
      fetchComments(selectedFileForComment.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openCommentDialog = (file: any) => {
    setSelectedFileForComment(file);
    setCommentDialogOpen(true);
    fetchComments(file.id);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Data Repository
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload, review, and approve data files
          </p>
        </div>
        {(userRole === 'admin' || userRole === 'user') && (
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New File</DialogTitle>
                <DialogDescription>Upload a file to the data repository</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Enter file subject/name"
                    value={fileSubject}
                    onChange={(e) => setFileSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUploadSubmit} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

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
                        {user?.id === file.uploaded_by && (
                          <>
                            <Dialog 
                              open={replaceDialogOpen && fileToReplaceId === file.id} 
                              onOpenChange={(open) => {
                                setReplaceDialogOpen(open);
                                if (open) setFileToReplaceId(file.id);
                                else setFileToReplaceId('');
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Replace File</DialogTitle>
                                  <DialogDescription>
                                    Upload a new version of {file.file_name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div>
                                  <Label htmlFor="replace-file">New File</Label>
                                  <Input
                                    id="replace-file"
                                    type="file"
                                    onChange={(e) => setFileToReplace(e.target.files?.[0] || null)}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button onClick={handleReplaceSubmit} disabled={uploading}>
                                    {uploading ? 'Replacing...' : 'Replace'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(file.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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
                        {(userRole === 'admin' || userRole === 'approver') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCommentDialog(file)}
                          >
                            <MessageSquare className="h-4 w-4" />
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

      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comments for {selectedFileForComment?.file_name}</DialogTitle>
            <DialogDescription>View and add comments for this file</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-comment">Add Comment</Label>
              <Textarea
                id="new-comment"
                placeholder="Enter your comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2"
                rows={3}
              />
              <Button onClick={handleAddComment} className="mt-2">
                Add Comment
              </Button>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Comment History</h4>
              <div className="max-h-80 overflow-y-auto space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No comments yet</p>
                ) : (
                  comments.map((c) => (
                    <Card key={c.id}>
                      <CardContent className="pt-4">
                        <p className="text-sm">{c.comment}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(c.created_at).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Repository;