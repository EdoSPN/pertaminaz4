import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, CalendarIcon, Check, ChevronsUpDown, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface MonitoringData {
  id: string;
  project_id: string;
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

interface Project {
  id: string;
  project_name: string;
}

export default function PrabumulihProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
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
  const [statusCategoryFilter, setStatusCategoryFilter] = useState<'ALL' | 'IFR' | 'IFA' | 'IFB'>('ALL');
  const [targetSubmitDate, setTargetSubmitDate] = useState<Date>();
  const [targetSubmitDateIFA, setTargetSubmitDateIFA] = useState<Date>();
  const [targetSubmitDateIFB, setTargetSubmitDateIFB] = useState<Date>();
  const [existingPics, setExistingPics] = useState<string[]>([]);
  const [picComboOpen, setPicComboOpen] = useState(false);
  const [editPicComboOpen, setEditPicComboOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchUserRole();
      fetchMonitoringData();
      fetchExistingPics();
    }
  }, [user, projectId]);

  const fetchProject = async () => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from('prabumulih_projects')
      .select('id, project_name')
      .eq('id', projectId)
      .maybeSingle();
    
    if (error || !data) {
      toast.error('Project not found');
      navigate('/prabumulih');
    } else {
      setProject(data);
    }
  };

  const fetchExistingPics = async () => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from('prabumulih_monitoring_data')
      .select('pic')
      .eq('project_id', projectId)
      .not('pic', 'is', null);

    if (!error && data) {
      const uniquePics = Array.from(new Set(data.map(item => item.pic).filter(Boolean))) as string[];
      setExistingPics(uniquePics.sort());
    }
  };

  const fetchUserRole = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
    if (data) {
      setUserRole(data.role);
    }
  };

  const fetchMonitoringData = async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('prabumulih_monitoring_data')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    
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
  const isAdmin = userRole === 'admin';

  const handleOpenEditDialog = (item: MonitoringData) => {
    setCurrentEditItem(item);
    const statusDesc = item.status_category === 'IFR' 
      ? item.status_description_ifr 
      : item.status_category === 'IFA' 
      ? item.status_description_ifa 
      : item.status_description_ifb;
    setEditStatusDescription(statusDesc);
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
    const updates: Record<string, unknown> = {};
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
      .from('prabumulih_monitoring_data')
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
    if (editPic.trim() && !existingPics.includes(editPic.trim())) {
      if (userRole !== 'admin' && userRole !== 'reviewer') {
        toast.error('Only Admin and Reviewer can add new PIC names');
        return;
      }
    }
    const originalFileName = currentEditItem.file_name;
    const commonUpdates = {
      file_name: editFileName,
      pic: editPic.trim() || null,
    };
    const { error } = await supabase
      .from('prabumulih_monitoring_data')
      .update(commonUpdates)
      .eq('file_name', originalFileName)
      .eq('project_id', projectId);
    if (!error) {
      const categoryUpdate: Record<string, unknown> = {};
      if (currentEditItem.status_category === 'IFR') {
        categoryUpdate.target_submit_ifr = editTargetSubmitDate ? editTargetSubmitDate.toISOString() : null;
      } else if (currentEditItem.status_category === 'IFA') {
        categoryUpdate.target_submit_ifa = editTargetSubmitDate ? editTargetSubmitDate.toISOString() : null;
      } else {
        categoryUpdate.target_submit_ifb = editTargetSubmitDate ? editTargetSubmitDate.toISOString() : null;
      }
      const { error: categoryError } = await supabase
        .from('prabumulih_monitoring_data')
        .update(categoryUpdate)
        .eq('file_name', editFileName)
        .eq('status_category', currentEditItem.status_category)
        .eq('project_id', projectId);
      if (categoryError) {
        toast.error('Failed to save target date');
        return;
      }
    }
    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Changes saved successfully');
      setReviewerEditDialogOpen(false);
      setCurrentEditItem(null);
      fetchMonitoringData();
      fetchExistingPics();
    }
  };

  const handleSaveApproval = async () => {
    if (!currentEditItem) return;
    const { error } = await supabase
      .from('prabumulih_monitoring_data')
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

  const handleDeleteData = async (fileName: string) => {
    const { error } = await supabase
      .from('prabumulih_monitoring_data')
      .delete()
      .eq('file_name', fileName)
      .eq('project_id', projectId);
    if (error) {
      toast.error('Failed to delete data');
    } else {
      toast.success('Data deleted successfully');
      fetchMonitoringData();
    }
  };

  const handleAddNew = async () => {
    if (!fileName.trim()) {
      toast.error('File name is required');
      return;
    }
    if (!projectId) return;
    if (pic.trim() && !existingPics.includes(pic.trim())) {
      if (userRole !== 'admin' && userRole !== 'reviewer') {
        toast.error('Only Admin and Reviewer can add new PIC names');
        return;
      }
    }
    const { error } = await supabase
      .from('prabumulih_monitoring_data')
      .insert([
        {
          project_id: projectId,
          file_name: fileName,
          pic: pic.trim() || null,
          status_category: 'IFR',
          target_submit_ifr: targetSubmitDate ? targetSubmitDate.toISOString() : null,
          target_submit_ifa: targetSubmitDateIFA ? targetSubmitDateIFA.toISOString() : null,
          target_submit_ifb: targetSubmitDateIFB ? targetSubmitDateIFB.toISOString() : null,
        },
        {
          project_id: projectId,
          file_name: fileName,
          pic: pic.trim() || null,
          status_category: 'IFA',
          target_submit_ifr: targetSubmitDate ? targetSubmitDate.toISOString() : null,
          target_submit_ifa: targetSubmitDateIFA ? targetSubmitDateIFA.toISOString() : null,
          target_submit_ifb: targetSubmitDateIFB ? targetSubmitDateIFB.toISOString() : null,
        },
        {
          project_id: projectId,
          file_name: fileName,
          pic: pic.trim() || null,
          status_category: 'IFB',
          target_submit_ifr: targetSubmitDate ? targetSubmitDate.toISOString() : null,
          target_submit_ifa: targetSubmitDateIFA ? targetSubmitDateIFA.toISOString() : null,
          target_submit_ifb: targetSubmitDateIFB ? targetSubmitDateIFB.toISOString() : null,
        },
      ]);
    if (error) {
      toast.error('Failed to add monitoring data');
    } else {
      toast.success('Monitoring data added successfully');
      setDialogOpen(false);
      setPic('');
      setFileName('');
      setTargetSubmitDate(undefined);
      setTargetSubmitDateIFA(undefined);
      setTargetSubmitDateIFB(undefined);
      fetchMonitoringData();
      fetchExistingPics();
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
    target.setHours(0, 0, 0, 0);
    actual.setHours(0, 0, 0, 0);
    if (actual > target) return 'Over Due';
    if (actual.getTime() === target.getTime()) return 'On Time';
    return 'Ahead';
  };

  const groupedData = monitoringData.reduce((acc, item) => {
    const picMatch = picFilter === 'all' || item.pic === picFilter;
    if (!picMatch) return acc;
    if (!acc[item.file_name]) {
      acc[item.file_name] = {
        file_name: item.file_name,
        pic: item.pic,
        id: item.id,
        ifr: null as MonitoringData | null,
        ifa: null as MonitoringData | null,
        ifb: null as MonitoringData | null,
      };
    }
    if (item.status_category === 'IFR') acc[item.file_name].ifr = item;
    if (item.status_category === 'IFA') acc[item.file_name].ifa = item;
    if (item.status_category === 'IFB') acc[item.file_name].ifb = item;
    return acc;
  }, {} as Record<string, { file_name: string; pic: string | null; id: string; ifr: MonitoringData | null; ifa: MonitoringData | null; ifb: MonitoringData | null }>);

  const groupedDataArray = Object.values(groupedData);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4 flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/prabumulih')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{project?.project_name || 'Project'} - Document Tracking</h1>
          <p className="text-muted-foreground">Manage document tracking for this project</p>
        </div>
      </div>

      <div className="mb-4 space-y-4">
        <div>
          <Label className="mb-2 block">Filter by:</Label>
          <div className="flex gap-2">
            <Button variant={statusCategoryFilter === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setStatusCategoryFilter('ALL')}>ALL</Button>
            <Button variant={statusCategoryFilter === 'IFR' ? 'default' : 'outline'} size="sm" onClick={() => setStatusCategoryFilter('IFR')}>IFR</Button>
            <Button variant={statusCategoryFilter === 'IFA' ? 'default' : 'outline'} size="sm" onClick={() => setStatusCategoryFilter('IFA')}>IFA</Button>
            <Button variant={statusCategoryFilter === 'IFB' ? 'default' : 'outline'} size="sm" onClick={() => setStatusCategoryFilter('IFB')}>IFB</Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="picFilter">PIC:</Label>
          <Select value={picFilter} onValueChange={setPicFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All PICs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PICs</SelectItem>
              {existingPics.map((picName) => (
                <SelectItem key={picName} value={picName}>{picName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canAddNew && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Data</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Document Tracking Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fileName">File Name</Label>
                  <Input id="fileName" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Enter file name" />
                </div>
                <div>
                  <Label htmlFor="pic">PIC</Label>
                  <Popover open={picComboOpen} onOpenChange={setPicComboOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={picComboOpen} className="w-full justify-between">
                        {pic || "Select or type PIC name..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search or type new PIC..." value={pic} onValueChange={setPic} />
                        <CommandList>
                          <CommandEmpty>
                            {pic.trim() && !existingPics.includes(pic.trim()) ? (
                              <div className="p-2 text-sm">
                                <div className="font-medium">Add new: "{pic}"</div>
                                {userRole !== 'admin' && userRole !== 'reviewer' && (
                                  <div className="text-xs text-destructive mt-1">Only Admin and Reviewer can add new PICs</div>
                                )}
                              </div>
                            ) : ("No PIC found.")}
                          </CommandEmpty>
                          <CommandGroup>
                            {existingPics.map((picName) => (
                              <CommandItem key={picName} value={picName} onSelect={(currentValue) => { setPic(currentValue); setPicComboOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", pic === picName ? "opacity-100" : "opacity-0")} />
                                {picName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Target Submit (IFR)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !targetSubmitDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {targetSubmitDate ? format(targetSubmitDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={targetSubmitDate} onSelect={setTargetSubmitDate} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Target Submit (IFA)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !targetSubmitDateIFA && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {targetSubmitDateIFA ? format(targetSubmitDateIFA, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={targetSubmitDateIFA} onSelect={setTargetSubmitDateIFA} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Target Submit (IFB)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !targetSubmitDateIFB && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {targetSubmitDateIFB ? format(targetSubmitDateIFB, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={targetSubmitDateIFB} onSelect={setTargetSubmitDateIFB} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button onClick={handleAddNew} className="w-full">Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
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
              {(canEditStatus || canEditFileInfo || canApprove || isAdmin) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={10} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : groupedDataArray.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="text-center py-8">No data available</TableCell></TableRow>
            ) : (
              groupedDataArray.map((group, groupIndex) => {
                const categories = ['IFR', 'IFA', 'IFB'] as const;
                const visibleCategories = statusCategoryFilter === 'ALL' ? categories : categories.filter(cat => cat === statusCategoryFilter);
                return visibleCategories.map((category, catIndex) => {
                  const item = group[category.toLowerCase() as 'ifr' | 'ifa' | 'ifb'];
                  const isFirstRow = catIndex === 0;
                  const targetDate = item ? (category === 'IFR' ? item.target_submit_ifr : category === 'IFA' ? item.target_submit_ifa : item.target_submit_ifb) : null;
                  const actualDate = item ? (category === 'IFR' ? item.actual_submit_ifr : category === 'IFA' ? item.actual_submit_ifa : item.actual_submit_ifb) : null;
                  const statusDescription = item ? (category === 'IFR' ? item.status_description_ifr : category === 'IFA' ? item.status_description_ifa : item.status_description_ifb) : 'Not Yet';
                  return (
                    <TableRow key={`${group.file_name}-${category}`}>
                      {isFirstRow && <TableCell rowSpan={visibleCategories.length}>{groupIndex + 1}</TableCell>}
                      {isFirstRow && <TableCell rowSpan={visibleCategories.length}>{group.file_name}</TableCell>}
                      <TableCell>{category}</TableCell>
                      <TableCell>{statusDescription}</TableCell>
                      {isFirstRow && <TableCell rowSpan={visibleCategories.length}>{group.pic || '-'}</TableCell>}
                      <TableCell>{formatDate(targetDate)}</TableCell>
                      <TableCell>{formatDate(actualDate)}</TableCell>
                      <TableCell>
                        {getSubmitExplanation(targetDate, actualDate) === 'Over Due' ? (
                          <span className="text-destructive font-medium">Over Due</span>
                        ) : getSubmitExplanation(targetDate, actualDate) === 'On Time' ? (
                          <span className="text-blue-600 font-medium">On Time</span>
                        ) : getSubmitExplanation(targetDate, actualDate) === 'Ahead' ? (
                          <span className="text-green-600 font-medium">Ahead</span>
                        ) : (<span>-</span>)}
                      </TableCell>
                      <TableCell>
                        {item ? (
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded text-xs ${item.approval_status === 'Approved' ? 'bg-green-100 text-green-800' : item.approval_status === 'Denied' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {item.approval_status}
                            </span>
                            {item.approval_comment && <span className="text-xs text-muted-foreground">{item.approval_comment}</span>}
                          </div>
                        ) : (<span>-</span>)}
                      </TableCell>
                      {(canEditStatus || canEditFileInfo || canApprove || isAdmin) && (
                        <TableCell>
                          {item ? (
                            <div className="flex gap-2">
                              {canEditStatus && (
                                <Button size="sm" variant="outline" onClick={() => handleOpenEditDialog(item)}>
                                  <Pencil className="h-4 w-4 mr-1" />Status
                                </Button>
                              )}
                              {canEditFileInfo && (
                                <Button size="sm" variant="outline" onClick={() => handleOpenReviewerEditDialog(item)}>
                                  <Pencil className="h-4 w-4 mr-1" />File Info
                                </Button>
                              )}
                              {canApprove && (
                                <Button size="sm" variant="outline" onClick={() => handleOpenApprovalDialog(item)}>
                                  <Pencil className="h-4 w-4 mr-1" />Approval
                                </Button>
                              )}
                              {isAdmin && isFirstRow && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline"><Trash2 className="h-4 w-4" /></Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Data</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete all data for "{group.file_name}"? This will remove all IFR, IFA, and IFB records. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteData(group.file_name)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          ) : (<span>-</span>)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                });
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* User/Admin Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status ({currentEditItem?.status_category})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="statusDescription">Status Description</Label>
              <Select value={editStatusDescription} onValueChange={(value) => setEditStatusDescription(value as 'Not Yet' | 'In-Progress' | 'Complete')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Yet">Not Yet</SelectItem>
                  <SelectItem value="In-Progress">In-Progress</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="actualSubmit">Actual Submit ({currentEditItem?.status_category})</Label>
              <Input id="actualSubmit" type="date" value={editActualSubmit} onChange={(e) => setEditActualSubmit(e.target.value)} />
            </div>
            <Button onClick={handleSaveEdit} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reviewer/Admin Edit Dialog */}
      <Dialog open={reviewerEditDialogOpen} onOpenChange={setReviewerEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFileName">File Name</Label>
              <Input id="editFileName" value={editFileName} onChange={(e) => setEditFileName(e.target.value)} placeholder="Enter file name" />
            </div>
            <div>
              <Label htmlFor="editPic">PIC</Label>
              <Popover open={editPicComboOpen} onOpenChange={setEditPicComboOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={editPicComboOpen} className="w-full justify-between">
                    {editPic || "Select or type PIC name..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search or type new PIC..." value={editPic} onValueChange={setEditPic} />
                    <CommandList>
                      <CommandEmpty>
                        {editPic.trim() && !existingPics.includes(editPic.trim()) ? (
                          <div className="p-2 text-sm">
                            <div className="font-medium">Add new: "{editPic}"</div>
                            {userRole !== 'admin' && userRole !== 'reviewer' && (
                              <div className="text-xs text-destructive mt-1">Only Admin and Reviewer can add new PICs</div>
                            )}
                          </div>
                        ) : ("No PIC found.")}
                      </CommandEmpty>
                      <CommandGroup>
                        {existingPics.map((picName) => (
                          <CommandItem key={picName} value={picName} onSelect={(currentValue) => { setEditPic(currentValue); setEditPicComboOpen(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", editPic === picName ? "opacity-100" : "opacity-0")} />
                            {picName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Target Submit ({currentEditItem?.status_category})</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editTargetSubmitDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editTargetSubmitDate ? format(editTargetSubmitDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={editTargetSubmitDate} onSelect={setEditTargetSubmitDate} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleSaveReviewerEdit} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approver/Admin Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Approval Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approvalStatus">Approval Status</Label>
              <Select value={approvalStatus} onValueChange={(value) => setApprovalStatus(value as 'Approved' | 'Denied' | 'Pending')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="approvalComment">Comment</Label>
              <Input id="approvalComment" value={approvalComment} onChange={(e) => setApprovalComment(e.target.value)} placeholder="Enter approval comment" />
            </div>
            <Button onClick={handleSaveApproval} className="w-full">Update Approval</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
