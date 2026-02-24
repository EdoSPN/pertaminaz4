import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, CalendarIcon, Check, ChevronsUpDown, Trash2, FileText, Printer, FolderOpen } from 'lucide-react';
import { DocumentFilesDialog } from '@/components/DocumentFilesDialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { validateMonitoringData } from '@/lib/validation';

const PROJECT_ID = '32ab11e0-59df-4e56-9586-a51315672be4';

type FieldType = 'Limau' | 'OK - RT' | 'Prabumulih';
type DisciplineType = 'Process' | 'Process Safety' | 'Mechanical' | 'Electrical' | 'Instrument' | 'Piping' | 'Civil & Structure' | 'Project Management';

const DISCIPLINE_ABBREVIATIONS: Record<DisciplineType, string> = {
  'Process': 'PR',
  'Process Safety': 'PS',
  'Mechanical': 'ME',
  'Electrical': 'EL',
  'Instrument': 'IN',
  'Piping': 'PI',
  'Civil & Structure': 'CS',
  'Project Management': 'PM',
};

interface MonitoringData {
  id: string;
  project_id: string;
  field: FieldType;
  file_name: string;
  document_number: string | null;
  status_category: 'IFR' | 'IFA' | 'IFB';
  status_description_ifr: 'Not Yet' | 'Start' | 'In-Progress' | 'Complete';
  status_description_ifa: 'Not Yet' | 'Start' | 'In-Progress' | 'Complete';
  status_description_ifb: 'Not Yet' | 'Start' | 'In-Progress' | 'Complete';
  pic: string | null;
  discipline: DisciplineType | null;
  target_submit_ifr: string | null;
  target_submit_ifa: string | null;
  target_submit_ifb: string | null;
  actual_submit_ifr: string | null;
  actual_submit_ifa: string | null;
  actual_submit_ifb: string | null;
  target_start_ifr: string | null;
  target_start_ifa: string | null;
  target_start_ifb: string | null;
  actual_start_ifr: string | null;
  actual_start_ifa: string | null;
  actual_start_ifb: string | null;
  approval_status: 'Approved' | 'Denied' | 'Pending' | 'Denied with Comment';
  approval_comment: string | null;
}

interface Project {
  id: string;
  project_name: string;
}

export default function Area2DocumentTracking() {
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
  const [editStatusDescription, setEditStatusDescription] = useState<'Not Yet' | 'Start' | 'In-Progress' | 'Complete'>('Not Yet');
  const [startTicketConfirmOpen, setStartTicketConfirmOpen] = useState(false);
  const [editActualSubmit, setEditActualSubmit] = useState('');
  const [editFileName, setEditFileName] = useState('');
  const [editPic, setEditPic] = useState('');
  const [editTargetSubmitDate, setEditTargetSubmitDate] = useState<Date>();
  const [approvalStatus, setApprovalStatus] = useState<'Approved' | 'Denied' | 'Pending' | 'Denied with Comment'>('Pending');
  const [approvalComment, setApprovalComment] = useState('');
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentDialogItem, setCommentDialogItem] = useState<MonitoringData | null>(null);
  const [picFilter, setPicFilter] = useState<string>('all');
  const [statusCategoryFilter, setStatusCategoryFilter] = useState<'ALL' | 'IFR' | 'IFA' | 'IFB'>('ALL');
  const [targetSubmitDate, setTargetSubmitDate] = useState<Date>();
  const [targetSubmitDateIFA, setTargetSubmitDateIFA] = useState<Date>();
  const [targetSubmitDateIFB, setTargetSubmitDateIFB] = useState<Date>();
  const [existingPics, setExistingPics] = useState<string[]>([]);
  const [picComboOpen, setPicComboOpen] = useState(false);
  const [editPicComboOpen, setEditPicComboOpen] = useState(false);
  const [documentNumber, setDocumentNumber] = useState('');
  const [editDocumentNumber, setEditDocumentNumber] = useState('');
  const [recapDialogOpen, setRecapDialogOpen] = useState(false);
  const [field, setField] = useState<FieldType>('Prabumulih');
  const [editField, setEditField] = useState<FieldType>('Prabumulih');
  const [discipline, setDiscipline] = useState<DisciplineType | null>(null);
  const [editDiscipline, setEditDiscipline] = useState<DisciplineType | null>(null);
  const [targetStartDate, setTargetStartDate] = useState<Date>();
  const [targetStartDateIFA, setTargetStartDateIFA] = useState<Date>();
  const [targetStartDateIFB, setTargetStartDateIFB] = useState<Date>();
  const [editTargetStartDate, setEditTargetStartDate] = useState<Date>();
  const [editActualStartDate, setEditActualStartDate] = useState('');
  const [fieldFilter, setFieldFilter] = useState<string[]>(['all']);
  const [fieldFilterOpen, setFieldFilterOpen] = useState(false);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [fileDialogItem, setFileDialogItem] = useState<MonitoringData | null>(null);
  const openFileDialog = (item: MonitoringData) => {
    setFileDialogItem(item);
    setFileDialogOpen(true);
  };

  const handleFieldFilterChange = (value: string, checked: boolean | 'indeterminate') => {
    if (value === 'all') {
      setFieldFilter(checked ? ['all'] : []);
    } else {
      setFieldFilter(prev => {
        let newFilter = prev.filter(f => f !== 'all');
        if (checked) {
          newFilter = [...newFilter, value];
        } else {
          newFilter = newFilter.filter(f => f !== value);
        }
        if (newFilter.length === 3) {
          return ['all'];
        }
        return newFilter;
      });
    }
  };

  useEffect(() => {
    fetchProject();
    fetchUserRole();
    fetchMonitoringData();
    fetchExistingPics();
  }, [user]);

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from('prabumulih_projects')
      .select('id, project_name')
      .eq('id', PROJECT_ID)
      .maybeSingle();
    
    if (error || !data) {
      toast.error('Project not found');
    } else {
      setProject(data);
    }
  };

  const fetchExistingPics = async () => {
    const { data, error } = await supabase
      .from('prabumulih_monitoring_data')
      .select('pic')
      .eq('project_id', PROJECT_ID)
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
    setLoading(true);
    const { data, error } = await supabase
      .from('prabumulih_monitoring_data')
      .select('*')
      .eq('project_id', PROJECT_ID)
      .order('created_at', { ascending: true });
    
    if (error) {
      toast.error('Failed to fetch monitoring data');
    } else {
      const mappedData = (data || []).map(item => ({
        ...item,
        field: (item.field || 'Prabumulih') as FieldType,
        discipline: item.discipline as DisciplineType | null,
      }));
      setMonitoringData(mappedData);
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
    const actualStartDate = item.status_category === 'IFR' 
      ? item.actual_start_ifr 
      : item.status_category === 'IFA' 
      ? item.actual_start_ifa 
      : item.actual_start_ifb;
    setEditActualStartDate(actualStartDate ? format(new Date(actualStartDate), 'yyyy-MM-dd') : '');
    setEditDialogOpen(true);
  };

  const handleOpenReviewerEditDialog = (item: MonitoringData) => {
    setCurrentEditItem(item);
    setEditFileName(item.file_name);
    setEditPic(item.pic || '');
    setEditDocumentNumber(item.document_number || '');
    setEditField(item.field || 'Prabumulih');
    setEditDiscipline(item.discipline || null);
    const targetDate = item.status_category === 'IFR' 
      ? item.target_submit_ifr 
      : item.status_category === 'IFA' 
      ? item.target_submit_ifa 
      : item.target_submit_ifb;
    setEditTargetSubmitDate(targetDate ? new Date(targetDate) : undefined);
    const targetStartDateVal = item.status_category === 'IFR' 
      ? item.target_start_ifr 
      : item.status_category === 'IFA' 
      ? item.target_start_ifa 
      : item.target_start_ifb;
    setEditTargetStartDate(targetStartDateVal ? new Date(targetStartDateVal) : undefined);
    setReviewerEditDialogOpen(true);
  };

  const handleOpenApprovalDialog = (item: MonitoringData) => {
    setCurrentEditItem(item);
    setApprovalStatus(item.approval_status);
    setApprovalComment(item.approval_comment || '');
    setApprovalDialogOpen(true);
  };

  const handleStartTicket = async () => {
    if (!currentEditItem) return;
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {};
    
    if (currentEditItem.status_category === 'IFR') {
      updates.status_description_ifr = 'Start';
      updates.actual_start_ifr = now;
    } else if (currentEditItem.status_category === 'IFA') {
      updates.status_description_ifa = 'Start';
      updates.actual_start_ifa = now;
    } else {
      updates.status_description_ifb = 'Start';
      updates.actual_start_ifb = now;
    }

    const { error } = await supabase
      .from('prabumulih_monitoring_data')
      .update(updates)
      .eq('id', currentEditItem.id);

    if (error) {
      toast.error('Failed to start ticket');
    } else {
      toast.success('Ticket started successfully');
      setEditDialogOpen(false);
      setStartTicketConfirmOpen(false);
      setCurrentEditItem(null);
      fetchMonitoringData();
    }
  };

  const handleSaveEdit = async () => {
    if (!currentEditItem) return;
    const updates: Record<string, unknown> = {};
    if (currentEditItem.status_category === 'IFR') {
      updates.status_description_ifr = editStatusDescription;
      updates.actual_start_ifr = editActualStartDate ? new Date(editActualStartDate).toISOString() : null;
      updates.actual_submit_ifr = editActualSubmit ? new Date(editActualSubmit).toISOString() : null;
    } else if (currentEditItem.status_category === 'IFA') {
      updates.status_description_ifa = editStatusDescription;
      updates.actual_start_ifa = editActualStartDate ? new Date(editActualStartDate).toISOString() : null;
      updates.actual_submit_ifa = editActualSubmit ? new Date(editActualSubmit).toISOString() : null;
    } else {
      updates.status_description_ifb = editStatusDescription;
      updates.actual_start_ifb = editActualStartDate ? new Date(editActualStartDate).toISOString() : null;
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
    
    const validation = validateMonitoringData({
      file_name: editFileName,
      pic: editPic.trim() || null,
      document_number: editDocumentNumber.trim() || null,
    });

    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    if (editPic.trim() && !existingPics.includes(editPic.trim())) {
      if (userRole !== 'admin' && userRole !== 'reviewer') {
        toast.error('Only Admin and Reviewer can add new PIC names');
        return;
      }
    }
    const originalFileName = currentEditItem.file_name;
    const commonUpdates = {
      file_name: validation.data.file_name,
      pic: validation.data.pic,
      document_number: validation.data.document_number,
      field: editField,
      discipline: editDiscipline,
    };
    const { error } = await supabase
      .from('prabumulih_monitoring_data')
      .update(commonUpdates)
      .eq('file_name', originalFileName)
      .eq('project_id', PROJECT_ID);
    if (!error) {
      const categoryUpdate: Record<string, unknown> = {};
      if (currentEditItem.status_category === 'IFR') {
        categoryUpdate.target_start_ifr = editTargetStartDate ? editTargetStartDate.toISOString() : null;
        categoryUpdate.target_submit_ifr = editTargetSubmitDate ? editTargetSubmitDate.toISOString() : null;
      } else if (currentEditItem.status_category === 'IFA') {
        categoryUpdate.target_start_ifa = editTargetStartDate ? editTargetStartDate.toISOString() : null;
        categoryUpdate.target_submit_ifa = editTargetSubmitDate ? editTargetSubmitDate.toISOString() : null;
      } else {
        categoryUpdate.target_start_ifb = editTargetStartDate ? editTargetStartDate.toISOString() : null;
        categoryUpdate.target_submit_ifb = editTargetSubmitDate ? editTargetSubmitDate.toISOString() : null;
      }
      const { error: categoryError } = await supabase
        .from('prabumulih_monitoring_data')
        .update(categoryUpdate)
        .eq('file_name', validation.data.file_name)
        .eq('status_category', currentEditItem.status_category)
        .eq('project_id', PROJECT_ID);
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
    
    // Require comment when status is "Denied with Comment"
    if (approvalStatus === 'Denied with Comment' && !approvalComment.trim()) {
      toast.error('Comment is required for "Denied with Comment" status');
      return;
    }
    
    const validation = validateMonitoringData({
      file_name: currentEditItem.file_name,
      approval_comment: approvalStatus === 'Denied with Comment' ? approvalComment.trim() : null,
    });

    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    const { error } = await supabase
      .from('prabumulih_monitoring_data')
      .update({
        approval_status: approvalStatus,
        approval_comment: approvalStatus === 'Denied with Comment' ? validation.data.approval_comment : null,
      })
      .eq('id', currentEditItem.id);
    if (error) {
      toast.error('Failed to update approval status');
    } else {
      toast.success('Approval status updated successfully');
      setApprovalDialogOpen(false);
      setCurrentEditItem(null);
      setApprovalComment('');
      fetchMonitoringData();
    }
  };

  const handleDeleteData = async (fileName: string) => {
    const { error } = await supabase
      .from('prabumulih_monitoring_data')
      .delete()
      .eq('file_name', fileName)
      .eq('project_id', PROJECT_ID);
    if (error) {
      toast.error('Failed to delete data');
    } else {
      toast.success('Data deleted successfully');
      fetchMonitoringData();
    }
  };

  const handleAddNew = async () => {
    const validation = validateMonitoringData({
      file_name: fileName,
      pic: pic.trim() || null,
      document_number: documentNumber.trim() || null,
    });

    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

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
          project_id: PROJECT_ID,
          field: field,
          file_name: validation.data.file_name,
          document_number: validation.data.document_number,
          pic: validation.data.pic,
          discipline: discipline,
          status_category: 'IFR',
          target_start_ifr: targetStartDate ? targetStartDate.toISOString() : null,
          target_start_ifa: targetStartDateIFA ? targetStartDateIFA.toISOString() : null,
          target_start_ifb: targetStartDateIFB ? targetStartDateIFB.toISOString() : null,
          target_submit_ifr: targetSubmitDate ? targetSubmitDate.toISOString() : null,
          target_submit_ifa: targetSubmitDateIFA ? targetSubmitDateIFA.toISOString() : null,
          target_submit_ifb: targetSubmitDateIFB ? targetSubmitDateIFB.toISOString() : null,
        },
        {
          project_id: PROJECT_ID,
          field: field,
          file_name: validation.data.file_name,
          document_number: validation.data.document_number,
          pic: validation.data.pic,
          discipline: discipline,
          status_category: 'IFA',
          target_start_ifr: targetStartDate ? targetStartDate.toISOString() : null,
          target_start_ifa: targetStartDateIFA ? targetStartDateIFA.toISOString() : null,
          target_start_ifb: targetStartDateIFB ? targetStartDateIFB.toISOString() : null,
          target_submit_ifr: targetSubmitDate ? targetSubmitDate.toISOString() : null,
          target_submit_ifa: targetSubmitDateIFA ? targetSubmitDateIFA.toISOString() : null,
          target_submit_ifb: targetSubmitDateIFB ? targetSubmitDateIFB.toISOString() : null,
        },
        {
          project_id: PROJECT_ID,
          field: field,
          file_name: validation.data.file_name,
          document_number: validation.data.document_number,
          pic: validation.data.pic,
          discipline: discipline,
          status_category: 'IFB',
          target_start_ifr: targetStartDate ? targetStartDate.toISOString() : null,
          target_start_ifa: targetStartDateIFA ? targetStartDateIFA.toISOString() : null,
          target_start_ifb: targetStartDateIFB ? targetStartDateIFB.toISOString() : null,
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
      setDocumentNumber('');
      setField('Prabumulih');
      setDiscipline(null);
      setTargetStartDate(undefined);
      setTargetStartDateIFA(undefined);
      setTargetStartDateIFB(undefined);
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

  const getRecapData = () => {
    const recapGroups = monitoringData.reduce((acc, item) => {
      if (!acc[item.file_name]) {
        acc[item.file_name] = {
          field: item.field || 'Prabumulih',
          document_number: item.document_number,
          file_name: item.file_name,
          pic: item.pic,
          discipline: item.discipline,
          status_ifr: 'Not Yet' as string,
          status_ifa: 'Not Yet' as string,
          status_ifb: 'Not Yet' as string,
        };
      }
      if (item.status_category === 'IFR') {
        acc[item.file_name].status_ifr = item.status_description_ifr || 'Not Yet';
      }
      if (item.status_category === 'IFA') {
        acc[item.file_name].status_ifa = item.status_description_ifa || 'Not Yet';
      }
      if (item.status_category === 'IFB') {
        acc[item.file_name].status_ifb = item.status_description_ifb || 'Not Yet';
      }
      return acc;
    }, {} as Record<string, { field: string; document_number: string | null; file_name: string; pic: string | null; discipline: DisciplineType | null; status_ifr: string; status_ifa: string; status_ifb: string }>);

    return Object.values(recapGroups).sort((a, b) => {
      const picA = (a.pic || '').toLowerCase();
      const picB = (b.pic || '').toLowerCase();
      if (picA !== picB) return picA.localeCompare(picB);
      return a.file_name.toLowerCase().localeCompare(b.file_name.toLowerCase());
    });
  };

  const groupedData = monitoringData.reduce((acc, item) => {
    const fieldMatch = fieldFilter.includes('all') || fieldFilter.includes(item.field);
    if (!fieldMatch) return acc;
    const picMatch = picFilter === 'all' || item.pic === picFilter;
    if (!picMatch) return acc;
    if (!acc[item.file_name]) {
      acc[item.file_name] = {
        field: item.field || 'Prabumulih',
        file_name: item.file_name,
        document_number: item.document_number,
        pic: item.pic,
        discipline: item.discipline,
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
  }, {} as Record<string, { field: string; file_name: string; document_number: string | null; pic: string | null; discipline: DisciplineType | null; id: string; ifr: MonitoringData | null; ifa: MonitoringData | null; ifb: MonitoringData | null }>);

  const sortedGroupedData = Object.values(groupedData).sort((a, b) => {
    const picA = (a.pic || '').toLowerCase();
    const picB = (b.pic || '').toLowerCase();
    if (picA !== picB) return picA.localeCompare(picB);
    return a.file_name.toLowerCase().localeCompare(b.file_name.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-800';
      case 'In-Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Start': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Denied': return 'bg-red-100 text-red-800';
      case 'Denied with Comment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getExplanationColor = (explanation: string) => {
    switch (explanation) {
      case 'Over Due': return 'text-red-600 font-medium';
      case 'On Time': return 'text-green-600 font-medium';
      case 'Ahead': return 'text-blue-600 font-medium';
      default: return '';
    }
  };

  const renderDataRows = (item: MonitoringData, group: { field: string; file_name: string; document_number: string | null; pic: string | null; discipline: DisciplineType | null; ifr: MonitoringData | null; ifa: MonitoringData | null; ifb: MonitoringData | null }, bgClass: string) => {
    const statusDesc = item.status_category === 'IFR' 
      ? item.status_description_ifr 
      : item.status_category === 'IFA' 
      ? item.status_description_ifa 
      : item.status_description_ifb;
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
    const targetStartDateVal = item.status_category === 'IFR' 
      ? item.target_start_ifr 
      : item.status_category === 'IFA' 
      ? item.target_start_ifa 
      : item.target_start_ifb;
    const actualStartDateVal = item.status_category === 'IFR' 
      ? item.actual_start_ifr 
      : item.status_category === 'IFA' 
      ? item.actual_start_ifa 
      : item.actual_start_ifb;
    const explanation = getSubmitExplanation(targetDate, actualDate);

    return (
      <TableRow key={item.id} className={bgClass}>
        <TableCell className="whitespace-nowrap">{group.field || 'Prabumulih'}</TableCell>
        <TableCell className="whitespace-nowrap">{group.document_number || '-'}</TableCell>
        <TableCell className="whitespace-nowrap">{group.file_name}</TableCell>
        <TableCell className="whitespace-nowrap">{item.status_category}</TableCell>
        <TableCell className="whitespace-nowrap">
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(statusDesc)}`}>
            {statusDesc}
          </span>
        </TableCell>
        <TableCell className="whitespace-nowrap">{group.pic || '-'}</TableCell>
        <TableCell className="whitespace-nowrap">
          {group.discipline ? DISCIPLINE_ABBREVIATIONS[group.discipline] : '-'}
        </TableCell>
        <TableCell className="whitespace-nowrap">{formatDate(targetStartDateVal)}</TableCell>
        <TableCell className="whitespace-nowrap">{formatDate(actualStartDateVal)}</TableCell>
        <TableCell className="whitespace-nowrap">{formatDate(targetDate)}</TableCell>
        <TableCell className="whitespace-nowrap">{formatDate(actualDate)}</TableCell>
        <TableCell className={`whitespace-nowrap ${getExplanationColor(explanation)}`}>{explanation}</TableCell>
        <TableCell className="whitespace-nowrap">
          {item.approval_status === 'Denied with Comment' ? (
            <button
              onClick={() => {
                setCommentDialogItem(item);
                setCommentDialogOpen(true);
              }}
              className={`px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity ${getApprovalStatusColor(item.approval_status)}`}
              title="Click to view comment"
            >
              {item.approval_status}
            </button>
          ) : (
            <span className={`px-2 py-1 rounded-full text-xs ${getApprovalStatusColor(item.approval_status)}`}>
              {item.approval_status}
            </span>
          )}
        </TableCell>
        <TableCell className="whitespace-nowrap">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => openFileDialog(item)} title="Download/Upload Files">
              <FolderOpen className="h-4 w-4" />
            </Button>
            {canEditStatus && (
              <Button variant="ghost" size="sm" onClick={() => handleOpenEditDialog(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {canEditFileInfo && (
              <Button variant="ghost" size="sm" onClick={() => handleOpenReviewerEditDialog(item)}>
                <FileText className="h-4 w-4" />
              </Button>
            )}
            {canApprove && (
              <Button variant="ghost" size="sm" onClick={() => handleOpenApprovalDialog(item)}>
                <Check className="h-4 w-4" />
              </Button>
            )}
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete all data for "{group.file_name}"? This will remove IFR, IFA, and IFB records.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteData(group.file_name)} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Area 2 - Document Tracking</h1>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col w-full sm:w-auto">
          <Label>Filter by Field</Label>
          <Popover open={fieldFilterOpen} onOpenChange={setFieldFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 w-full sm:w-[200px] justify-between">
                {fieldFilter.includes('all') 
                  ? 'All Fields' 
                  : fieldFilter.length === 1 
                    ? fieldFilter[0] 
                    : `${fieldFilter.length} selected`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2 z-50 bg-white border shadow-md">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="field-all"
                    checked={fieldFilter.includes('all')} 
                    onCheckedChange={(checked) => handleFieldFilterChange('all', checked)} 
                  />
                  <label htmlFor="field-all" className="text-sm cursor-pointer">All</label>
                </div>
                {['Limau', 'OK - RT', 'Prabumulih'].map((f) => (
                  <div key={f} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`field-${f}`}
                      checked={fieldFilter.includes('all') ? true : fieldFilter.includes(f)} 
                      onCheckedChange={(checked) => handleFieldFilterChange(f, checked)} 
                    />
                    <label htmlFor={`field-${f}`} className="text-sm cursor-pointer">{f}</label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-full sm:w-auto">
          <Label>Filter by Status Category</Label>
          <Select value={statusCategoryFilter} onValueChange={(value: 'ALL' | 'IFR' | 'IFA' | 'IFB') => setStatusCategoryFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="IFR">IFR</SelectItem>
              <SelectItem value="IFA">IFA</SelectItem>
              <SelectItem value="IFB">IFB</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-auto">
          <Label>Filter by PIC</Label>
          <Select value={picFilter} onValueChange={setPicFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All PICs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PICs</SelectItem>
              {existingPics.map((existingPic) => (
                <SelectItem key={existingPic} value={existingPic}>{existingPic}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Dialog open={recapDialogOpen} onOpenChange={setRecapDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Data Recap
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Data Recap - Area 2 Document Tracking</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Doc Number</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>PIC</TableHead>
                    <TableHead>DISC</TableHead>
                    <TableHead>IFR</TableHead>
                    <TableHead>IFA</TableHead>
                    <TableHead>IFB</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getRecapData().map((item, index) => (
                    <TableRow key={item.file_name}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.field || 'Prabumulih'}</TableCell>
                      <TableCell>{item.document_number || '-'}</TableCell>
                      <TableCell>{item.file_name}</TableCell>
                      <TableCell>{item.pic || '-'}</TableCell>
                      <TableCell>
                        {item.discipline ? DISCIPLINE_ABBREVIATIONS[item.discipline as DisciplineType] : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status_ifr)}`}>
                          {item.status_ifr}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status_ifa)}`}>
                          {item.status_ifa}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status_ifb)}`}>
                          {item.status_ifb}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
        {canAddNew && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Add New Document Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                <div>
                  <Label>Field</Label>
                  <Select value={field} onValueChange={(value: FieldType) => setField(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Limau">Limau</SelectItem>
                      <SelectItem value="OK - RT">OK - RT</SelectItem>
                      <SelectItem value="Prabumulih">Prabumulih</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>File Name</Label>
                  <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Enter file name" />
                </div>
                <div>
                  <Label>Document Number</Label>
                  <Input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="Enter document number" />
                </div>
                <div>
                  <Label>PIC</Label>
                  <Popover open={picComboOpen} onOpenChange={setPicComboOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {pic || "Select or type PIC..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search or type PIC..." 
                          value={pic}
                          onValueChange={(value) => {
                            setPic(value);
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {pic ? `Use "${pic}" as PIC` : "Type to search..."}
                          </CommandEmpty>
                          <CommandGroup>
                            {existingPics
                              .filter(existingPic => existingPic.toLowerCase().includes(pic.toLowerCase()))
                              .map((existingPic) => (
                                <CommandItem
                                  key={existingPic}
                                  value={existingPic}
                                  onSelect={(value) => {
                                    setPic(value);
                                    setPicComboOpen(false);
                                  }}
                                >
                                  {existingPic}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Discipline</Label>
                  <Select value={discipline || ''} onValueChange={(value: DisciplineType) => setDiscipline(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Process">Process</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Piping">Piping</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Instrument">Instrument</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Submit IFR</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {targetSubmitDate ? format(targetSubmitDate, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar mode="single" selected={targetSubmitDate} onSelect={setTargetSubmitDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Target Start IFR</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {targetStartDate ? format(targetStartDate, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar mode="single" selected={targetStartDate} onSelect={setTargetStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button onClick={handleAddNew} className="w-full">Add Data</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : sortedGroupedData.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No monitoring data found</div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Field</TableHead>
                <TableHead className="whitespace-nowrap">Doc Number</TableHead>
                <TableHead className="whitespace-nowrap min-w-[200px]">File Name</TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">PIC</TableHead>
                <TableHead className="whitespace-nowrap">DISC</TableHead>
                <TableHead className="whitespace-nowrap">Target Start</TableHead>
                <TableHead className="whitespace-nowrap">Actual Start</TableHead>
                <TableHead className="whitespace-nowrap">Target Submit</TableHead>
                <TableHead className="whitespace-nowrap">Actual Submit</TableHead>
                <TableHead className="whitespace-nowrap">Submit Status</TableHead>
                <TableHead className="whitespace-nowrap">Approval</TableHead>
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGroupedData.map((group, groupIndex) => {
                const items: MonitoringData[] = [];
                if (statusCategoryFilter === 'ALL' || statusCategoryFilter === 'IFR') {
                  if (group.ifr) items.push(group.ifr);
                }
                if (statusCategoryFilter === 'ALL' || statusCategoryFilter === 'IFA') {
                  if (group.ifa) items.push(group.ifa);
                }
                if (statusCategoryFilter === 'ALL' || statusCategoryFilter === 'IFB') {
                  if (group.ifb) items.push(group.ifb);
                }
                const groupBgClass = groupIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50';
                return items.map((item) => renderDataRows(item, group, groupBgClass));
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Status Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) setStartTicketConfirmOpen(false);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status - {currentEditItem?.status_category}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status Description</Label>
              <Select 
                value={editStatusDescription} 
                onValueChange={(value: 'Not Yet' | 'Start' | 'In-Progress' | 'Complete') => setEditStatusDescription(value)}
                disabled={editStatusDescription === 'Not Yet'}
              >
                <SelectTrigger className={editStatusDescription === 'Not Yet' ? 'opacity-50' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Yet">Not Yet</SelectItem>
                  <SelectItem value="Start">Start</SelectItem>
                  <SelectItem value="In-Progress">In-Progress</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Actual Start Date</Label>
              <Input
                type="date"
                value={editActualStartDate}
                onChange={(e) => setEditActualStartDate(e.target.value)}
                disabled={editStatusDescription === 'Not Yet'}
                className={editStatusDescription === 'Not Yet' ? 'opacity-50' : ''}
              />
            </div>
            <div>
              <Label>Actual Submit Date</Label>
              <Input
                type="date"
                value={editActualSubmit}
                onChange={(e) => setEditActualSubmit(e.target.value)}
                disabled={editStatusDescription === 'Not Yet'}
                className={editStatusDescription === 'Not Yet' ? 'opacity-50' : ''}
              />
            </div>
            
            {/* Start Ticket button - only shown when status is "Not Yet" */}
            {editStatusDescription === 'Not Yet' && (
              <AlertDialog open={startTicketConfirmOpen} onOpenChange={setStartTicketConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Start Ticket
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Start Ticket</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will set the status to "Start" and record today as the 
                      Actual Start date. The status will automatically change to 
                      "In-Progress" after 1 day. Are you sure?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleStartTicket}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {/* Save Changes button - only shown when status is NOT "Not Yet" */}
            {editStatusDescription !== 'Not Yet' && (
              <Button onClick={handleSaveEdit} className="w-full">Save Changes</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit File Info Dialog */}
      <Dialog open={reviewerEditDialogOpen} onOpenChange={setReviewerEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit File Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <Label>Field</Label>
              <Select value={editField} onValueChange={(value: FieldType) => setEditField(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Limau">Limau</SelectItem>
                  <SelectItem value="OK - RT">OK - RT</SelectItem>
                  <SelectItem value="Prabumulih">Prabumulih</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>File Name</Label>
              <Input
                value={editFileName}
                onChange={(e) => setEditFileName(e.target.value)}
              />
            </div>
            <div>
              <Label>Document Number</Label>
              <Input
                value={editDocumentNumber}
                onChange={(e) => setEditDocumentNumber(e.target.value)}
              />
            </div>
            <div>
              <Label>PIC</Label>
              <Popover open={editPicComboOpen} onOpenChange={setEditPicComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={editPicComboOpen}
                    className="w-full justify-between"
                  >
                    {editPic || "Select or type PIC..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search or type new PIC..."
                      value={editPic}
                      onValueChange={setEditPic}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {editPic ? `Add "${editPic}" as new PIC` : 'No PIC found'}
                      </CommandEmpty>
                      <CommandGroup>
                        {existingPics.map((existingPic) => (
                          <CommandItem
                            key={existingPic}
                            value={existingPic}
                            onSelect={(value) => {
                              setEditPic(value);
                              setEditPicComboOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                editPic === existingPic ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {existingPic}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Discipline</Label>
              <Select 
                value={editDiscipline || ''} 
                onValueChange={(value: DisciplineType) => setEditDiscipline(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Process">Process</SelectItem>
                  <SelectItem value="Process Safety">Process Safety</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Instrument">Instrument</SelectItem>
                  <SelectItem value="Piping">Piping</SelectItem>
                  <SelectItem value="Civil & Structure">Civil & Structure</SelectItem>
                  <SelectItem value="Project Management">Project Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target Start Date ({currentEditItem?.status_category})</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editTargetStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editTargetStartDate ? format(editTargetStartDate, 'dd/MM/yyyy') : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editTargetStartDate}
                    onSelect={setEditTargetStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Target Submit Date ({currentEditItem?.status_category})</Label>
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
                    {editTargetSubmitDate ? format(editTargetSubmitDate, 'dd/MM/yyyy') : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
            <Button onClick={handleSaveReviewerEdit} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Approval Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Approval Status</Label>
              <Select 
                value={approvalStatus} 
                onValueChange={(value: 'Approved' | 'Denied' | 'Pending' | 'Denied with Comment') => {
                  setApprovalStatus(value);
                  if (value !== 'Denied with Comment') {
                    setApprovalComment('');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Denied">Denied</SelectItem>
                  <SelectItem value="Denied with Comment">Denied with Comment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {approvalStatus === 'Denied with Comment' && (
              <div>
                <Label>Comment <span className="text-red-500">*</span></Label>
                <Textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="Enter reason for denial..."
                  className="min-h-[100px]"
                />
              </div>
            )}
            <Button onClick={handleSaveApproval} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment View Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                Denied with Comment
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">File Name</Label>
              <p className="font-medium">{commentDialogItem?.file_name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Category</Label>
              <p className="font-medium">{commentDialogItem?.status_category}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Denial Comment</Label>
              <div className="mt-1 p-3 bg-slate-50 rounded-lg border">
                <p className="text-sm whitespace-pre-wrap">
                  {commentDialogItem?.approval_comment || 'No comment provided'}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Files Dialog */}
      <DocumentFilesDialog
        open={fileDialogOpen}
        onOpenChange={setFileDialogOpen}
        item={fileDialogItem}
        userId={user?.id || ''}
        userEmail={user?.email || ''}
      />
    </div>
  );
}
