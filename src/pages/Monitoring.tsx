import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
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
  const [pic, setPic] = useState('');
  const [fileName, setFileName] = useState('');
  const [currentEditItem, setCurrentEditItem] = useState<MonitoringData | null>(null);
  const [editStatusDescription, setEditStatusDescription] = useState<'Not Yet' | 'In-Progress' | 'Complete'>('Not Yet');
  const [editActualSubmit, setEditActualSubmit] = useState('');
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
  const canEdit = userRole === 'admin' || userRole === 'user';
  
  const handleStatusCategoryChange = async (id: string, value: 'IFR' | 'IFA' | 'IFB') => {
    if (!canEdit) return;

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
  const handleAddNew = async () => {
    if (!fileName.trim()) {
      toast.error('File name is required');
      return;
    }

    const { error } = await supabase
      .from('monitoring_data')
      .insert({
        file_name: fileName,
        pic: pic.trim() || null,
      });

    if (error) {
      toast.error('Failed to add monitoring data');
    } else {
      toast.success('Monitoring data added successfully');
      setDialogOpen(false);
      setPic('');
      setFileName('');
      fetchMonitoringData();
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy');
  };
  return <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Monitoring</h1>
        {canEdit && (
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
                  <Select value={pic} onValueChange={setPic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PIC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Slamet">Slamet</SelectItem>
                      <SelectItem value="Eka">Eka</SelectItem>
                      <SelectItem value="Edo">Edo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddNew} className="w-full">
                  Add
                </Button>
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
              <TableHead>Approval</TableHead>
              {canEdit && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow> : monitoringData.length === 0 ? <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No data available
                </TableCell>
              </TableRow> : monitoringData.map((item, index) => {
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
                    <Select value={item.status_category} onValueChange={value => handleStatusCategoryChange(item.id, value as 'IFR' | 'IFA' | 'IFB')} disabled={!canEdit}>
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
                    <span className={`px-2 py-1 rounded text-xs ${item.approval_status === 'Approved' ? 'bg-green-100 text-green-800' : item.approval_status === 'Denied' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {item.approval_status}
                    </span>
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <Button size="sm" onClick={() => handleOpenEditDialog(item)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              })}
          </TableBody>
          </Table>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Monitoring Data ({currentEditItem?.status_category})</DialogTitle>
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
    </div>;
}