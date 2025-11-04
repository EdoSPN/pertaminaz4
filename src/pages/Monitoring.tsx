import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
interface MonitoringData {
  id: string;
  file_name: string;
  status_category: 'IFR' | 'IFA' | 'IFB';
  status_description_ifr: 'Not Yet' | 'In-Progress' | 'Complete';
  status_description_ifa: 'Not Yet' | 'In-Progress' | 'Complete';
  status_description_ifb: 'Not Yet' | 'In-Progress' | 'Complete';
  pic: string | null;
  target_submit_ifr: string | null;
  target_submit_ifa: string | null;
  target_submit_ifb: string | null;
  actual_submit_ifr: string | null;
  actual_submit_ifa: string | null;
  actual_submit_ifb: string | null;
  approval_status: 'Approved' | 'Denied' | 'Pending';
  approval_comment: string | null;
}
export default function Monitoring() {
  const {
    user
  } = useAuth();
  const [monitoringData, setMonitoringData] = useState<MonitoringData[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reviewerEditDialogOpen, setReviewerEditDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [pic, setPic] = useState('');
  const [fileName, setFileName] = useState('');
  const [currentEditItem, setCurrentEditItem] = useState<MonitoringData | null>(null);
  const [editStatusDescription, setEditStatusDescription] = useState<'Not Yet' | 'In-Progress' | 'Complete'>('Not Yet');
  const [editActualSubmit, setEditActualSubmit] = useState('');
  const [editFileName, setEditFileName] = useState('');
  const [editPic, setEditPic] = useState('');
  const [editTargetSubmitDate, setEditTargetSubmitDate] = useState<Date>();
  const [approvalStatus, setApprovalStatus] = useState<'Approved' | 'Denied' | 'Pending'>('Pending');
  const [approvalComment, setApprovalComment] = useState('');
  const [picFilter, setPicFilter] = useState<string>('all');
  const [targetSubmitDate, setTargetSubmitDate] = useState<Date>();
  const existingPics = ['Slamet', 'Eka', 'Edo'];
  useEffect(() => {
    fetchUserRole();
    fetchMonitoringData();
  }, [user]);
  const fetchUserRole = async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
    if (data) {
      setUserRole(data.role);
    }
  };
  const fetchMonitoringData = async () => {
    setLoading(true);
    const {
      data,
      error
    } = await supabase.from('monitoring_data').select('*').order('created_at', {
      ascending: true
    });
    if (error) {
      toast.error('Failed to fetch monitoring data');
    } else {
      setMonitoringData(data || []);
    }
    setLoading(false);
  };
  const canAddNew = userRole === 'admin' || userRole === 'reviewer';
  const canEditStatus = userRole === 'admin' || userRole === 'user';
  const canEditFileInfo = userRole === 'admin' || userRole === 'reviewer';
  const canApprove = userRole === 'admin' || userRole === 'approver';
  
  const handleStatusCategoryChange = async (id: string, value: 'IFR' | 'IFA' | 'IFB') => {
    if (!canEditFileInfo) return;

    const { error } = await supabase
      .from('monitoring_data')
      .update({ status_category: value })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status category');
    } else {
      toast.success('Status category updated');
      fetchMonitoringData();
    }
  };

  const handleOpenEditDialog = (item: MonitoringData) => {
    setCurrentEditItem(item);
    
    // Get the status description based on current status category
    const statusDesc = item.status_category === 'IFR' 
      ? item.status_description_ifr 
      : item.status_category === 'IFA' 
      ? item.status_description_ifa 
      : item.status_description_ifb;
    
    setEditStatusDescription(statusDesc);
    
    // Get the actual submit date based on current status category
    const actualDate = item.status_category === 'IFR' 
      ? item.actual_submit_ifr 
      : item.status_category === 'IFA' 
      ? item.actual_submit_ifa 
      : item.actual_submit_ifb;
    
    setEditActualSubmit(actualDate ? format(new Date(actualDate), 'yyyy-MM-dd') : '');
    setEditDialogOpen(true);
  };

  const handleOpenReviewerEditDialog = (item: MonitoringData) => {
    setCurrentEditItem(item);
    setEditFileName(item.file_name);
    setEditPic(item.pic || '');
    
    // Get target date based on status category
    const targetDate = item.status_category === 'IFR' 
      ? item.target_submit_ifr 
      : item.status_category === 'IFA' 
      ? item.target_submit_ifa 
      : item.target_submit_ifb;
    
    setEditTargetSubmitDate(targetDate ? new Date(targetDate) : undefined);
    setReviewerEditDialogOpen(true);
  };

  const handleOpenApprovalDialog = (item: MonitoringData) => {
    setCurrentEditItem(item);
    setApprovalStatus(item.approval_status);
    setApprovalComment(item.approval_comment || '');
    setApprovalDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!currentEditItem) return;

    const updates: Partial<MonitoringData> = {};

    // Update the appropriate status_description and actual_submit fields based on status_category
    if (currentEditItem.status_category === 'IFR') {
      updates.status_description_ifr = editStatusDescription;
      updates.actual_submit_ifr = editActualSubmit ? new Date(editActualSubmit).toISOString() : null;
    } else if (currentEditItem.status_category === 'IFA') {
      updates.status_description_ifa = editStatusDescription;
      updates.actual_submit_ifa = editActualSubmit ? new Date(editActualSubmit).toISOString() : null;
    } else {
      updates.status_description_ifb = editStatusDescription;
      updates.actual_submit_ifb = editActualSubmit ? new Date(editActualSubmit).toISOString() : null;
    }

    const { error } = await supabase
      .from('monitoring_data')
      .update(updates)
      .eq('id', currentEditItem.id);

    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Changes saved successfully');
      setEditDialogOpen(false);
      setCurrentEditItem(null);
      fetchMonitoringData();
    }
  };

  const handleSaveReviewerEdit = async () => {
    if (!currentEditItem) return;

    // Check if PIC is new and user has permission
    if (editPic.trim() && !existingPics.includes(editPic.trim())) {
      if (userRole !== 'admin' && userRole !== 'reviewer') {
        toast.error('Only Admin and Reviewer can add new PIC names');
        return;
      }
    }

    const updates: Partial<MonitoringData> = {
      file_name: editFileName,
      pic: editPic.trim() || null,
    };

    // Update the appropriate target_submit field based on status_category
    if (currentEditItem.status_category === 'IFR') {
      updates.target_submit_ifr = editTargetSubmitDate ? editTargetSubmitDate.toISOString() : null;
    } else if (currentEditItem.status_category === 'IFA') {
      updates.target_submit_ifa = editTargetSubmitDate ? editTargetSubmitDate.toISOString() : null;
    } else {
      updates.target_submit_ifb = editTargetSubmitDate ? editTargetSubmitDate.toISOString() : null;
    }

    const { error } = await supabase
      .from('monitoring_data')
      .update(updates)
      .eq('id', currentEditItem.id);

    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Changes saved successfully');
      setReviewerEditDialogOpen(false);
      setCurrentEditItem(null);
      fetchMonitoringData();
    }
  };

  const handleSaveApproval = async () => {
    if (!currentEditItem) return;

    const { error } = await supabase
      .from('monitoring_data')
      .update({
        approval_status: approvalStatus,
        approval_comment: approvalComment.trim() || null,
      })
      .eq('id', currentEditItem.id);

    if (error) {
      toast.error('Failed to update approval status');
    } else {
      toast.success('Approval status updated successfully');
      setApprovalDialogOpen(false);
      setCurrentEditItem(null);
      fetchMonitoringData();
    }
  };
  const handleAddNew = async () => {
    if (!fileName.trim()) {
      toast.error('File name is required');
      return;
    }

    // Check if PIC is new and user has permission
    if (pic.trim() && !existingPics.includes(pic.trim())) {
      if (userRole !== 'admin' && userRole !== 'reviewer') {
        toast.error('Only Admin and Reviewer can add new PIC names');
        return;
      }
    }

    const { error } = await supabase
      .from('monitoring_data')
      .insert({
        file_name: fileName,
        pic: pic.trim() || null,
        target_submit_ifr: targetSubmitDate ? targetSubmitDate.toISOString() : null,
      });

    if (error) {
      toast.error('Failed to add monitoring data');
    } else {
      toast.success('Monitoring data added successfully');
      setDialogOpen(false);
      setPic('');
      setFileName('');
      setTargetSubmitDate(undefined);
      fetchMonitoringData();
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy');
  };

  const getSubmitExplanation = (targetDate: string | null, actualDate: string | null) => {
    if (!targetDate || !actualDate) return '-';
    
    const target = new Date(targetDate);
    const actual = new Date(actualDate);
    
    return actual > target ? 'Over Due' : 'On Time';
  };
  const filteredData = picFilter === 'all' 
    ? monitoringData 
    : monitoringData.filter(item => item.pic === picFilter);

  return <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Data Monitoring</h1>
        {canAddNew && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Monitoring Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter file name"
                  />
                </div>
                <div>
                  <Label htmlFor="pic">PIC</Label>
                  <Input
                    id="pic"
                    value={pic}
                    onChange={(e) => setPic(e.target.value)}
                    placeholder="Enter or select PIC name"
                    list="pic-options"
                  />
                  <datalist id="pic-options">
                    {existingPics.map((picName) => (
                      <option key={picName} value={picName} />
                    ))}
                  </datalist>
                  {pic.trim() && !existingPics.includes(pic.trim()) && userRole !== 'admin' && userRole !== 'reviewer' && (
                    <p className="text-xs text-destructive mt-1">Only Admin and Reviewer can add new PIC names</p>
                  )}
                </div>
                <div>
                  <Label>Target Submit (IFR)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !targetSubmitDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {targetSubmitDate ? format(targetSubmitDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={targetSubmitDate}
                        onSelect={setTargetSubmitDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button onClick={handleAddNew} className="w-full">
                  Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="picFilter">Filter by PIC:</Label>
          <Select value={picFilter} onValueChange={setPicFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All PICs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PICs</SelectItem>
              <SelectItem value="Slamet">Slamet</SelectItem>
              <SelectItem value="Eka">Eka</SelectItem>
              <SelectItem value="Edo">Edo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Status Category</TableHead>
              <TableHead>Status Description</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead>Target Submit</TableHead>
              <TableHead>Actual Submit</TableHead>
              <TableHead>Submit Explain</TableHead>
              <TableHead>Approval</TableHead>
              {(canEditStatus || canEditFileInfo || canApprove) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow> : filteredData.length === 0 ? <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No data available
                </TableCell>
              </TableRow> : filteredData.map((item, index) => {
                // Determine which dates to show based on status_category
                const targetDate = item.status_category === 'IFR' 
                  ? item.target_submit_ifr 
                  : item.status_category === 'IFA' 
                  ? item.target_submit_ifa 
                  : item.target_submit_ifb;
                
                const actualDate = item.status_category === 'IFR' 
                  ? item.actual_submit_ifr 
                  : item.status_category === 'IFA' 
                  ? item.actual_submit_ifa 
                  : item.actual_submit_ifb;
                
                const statusDescription = item.status_category === 'IFR' 
                  ? item.status_description_ifr 
                  : item.status_category === 'IFA' 
                  ? item.status_description_ifa 
                  : item.status_description_ifb;
                
                return <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.file_name}</TableCell>
                  <TableCell>
                    <Select value={item.status_category} onValueChange={value => handleStatusCategoryChange(item.id, value as 'IFR' | 'IFA' | 'IFB')} disabled={!canEditFileInfo}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IFR">IFR</SelectItem>
                        <SelectItem value="IFA">IFA</SelectItem>
                        <SelectItem value="IFB">IFB</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{statusDescription}</TableCell>
                  <TableCell>{item.pic || '-'}</TableCell>
                  <TableCell>{formatDate(targetDate)}</TableCell>
                  <TableCell>{formatDate(actualDate)}</TableCell>
                  <TableCell>
                    {getSubmitExplanation(targetDate, actualDate) === 'Over Due' ? (
                      <span className="text-destructive font-medium">Over Due</span>
                    ) : getSubmitExplanation(targetDate, actualDate) === 'On Time' ? (
                      <span className="text-green-600 font-medium">On Time</span>
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded text-xs ${item.approval_status === 'Approved' ? 'bg-green-100 text-green-800' : item.approval_status === 'Denied' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.approval_status}
                      </span>
                      {item.approval_comment && (
                        <span className="text-xs text-muted-foreground">{item.approval_comment}</span>
                      )}
                    </div>
                  </TableCell>
                  {(canEditStatus || canEditFileInfo || canApprove) && (
                    <TableCell>
                      <div className="flex gap-2">
                        {canEditStatus && (
                          <Button size="sm" variant="outline" onClick={() => handleOpenEditDialog(item)}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Status
                          </Button>
                        )}
                        {canEditFileInfo && (
                          <Button size="sm" variant="outline" onClick={() => handleOpenReviewerEditDialog(item)}>
                            <Pencil className="h-4 w-4 mr-1" />
                            File Info
                          </Button>
                        )}
                        {canApprove && (
                          <Button size="sm" variant="outline" onClick={() => handleOpenApprovalDialog(item)}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Approval
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              })}
          </TableBody>
          </Table>
      </div>

      {/* User/Admin Edit Dialog - Status and Actual Submit */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status ({currentEditItem?.status_category})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="statusDescription">Status Description</Label>
              <Select value={editStatusDescription} onValueChange={(value) => setEditStatusDescription(value as 'Not Yet' | 'In-Progress' | 'Complete')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Yet">Not Yet</SelectItem>
                  <SelectItem value="In-Progress">In-Progress</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="actualSubmit">Actual Submit ({currentEditItem?.status_category})</Label>
              <Input
                id="actualSubmit"
                type="date"
                value={editActualSubmit}
                onChange={(e) => setEditActualSubmit(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveEdit} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reviewer/Admin Edit Dialog - File Info and Target Submit */}
      <Dialog open={reviewerEditDialogOpen} onOpenChange={setReviewerEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFileName">File Name</Label>
              <Input
                id="editFileName"
                value={editFileName}
                onChange={(e) => setEditFileName(e.target.value)}
                placeholder="Enter file name"
              />
            </div>
            <div>
              <Label htmlFor="editPic">PIC</Label>
              <Input
                id="editPic"
                value={editPic}
                onChange={(e) => setEditPic(e.target.value)}
                placeholder="Enter or select PIC name"
                list="edit-pic-options"
              />
              <datalist id="edit-pic-options">
                {existingPics.map((picName) => (
                  <option key={picName} value={picName} />
                ))}
              </datalist>
              {editPic.trim() && !existingPics.includes(editPic.trim()) && userRole !== 'admin' && userRole !== 'reviewer' && (
                <p className="text-xs text-destructive mt-1">Only Admin and Reviewer can add new PIC names</p>
              )}
            </div>
            <div>
              <Label>Target Submit ({currentEditItem?.status_category})</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editTargetSubmitDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editTargetSubmitDate ? format(editTargetSubmitDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editTargetSubmitDate}
                    onSelect={setEditTargetSubmitDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleSaveReviewerEdit} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approver/Admin Dialog - Approval Status and Comment */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Approval Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approvalStatus">Approval Status</Label>
              <Select value={approvalStatus} onValueChange={(value) => setApprovalStatus(value as 'Approved' | 'Denied' | 'Pending')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="approvalComment">Comment</Label>
              <Input
                id="approvalComment"
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="Enter approval comment"
              />
            </div>
            <Button onClick={handleSaveApproval} className="w-full">
              Update Approval
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}