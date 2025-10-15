import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MonitoringData {
  id: string;
  file_name: string;
  status_category: 'IFR' | 'IFA' | 'IFB';
  status_description: 'Not Yet' | 'In-Progress' | 'Complete';
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
  const { user } = useAuth();
  const [monitoringData, setMonitoringData] = useState<MonitoringData[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
    fetchMonitoringData();
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setUserRole(data.role);
    }
  };

  const fetchMonitoringData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('monitoring_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch monitoring data');
    } else {
      setMonitoringData(data || []);
    }
    setLoading(false);
  };

  const canEdit = userRole === 'admin' || userRole === 'user';

  const handleStatusCategoryChange = async (id: string, value: string) => {
    if (!canEdit) return;

    const { error } = await supabase
      .from('monitoring_data')
      .update({ status_category: value as 'IFR' | 'IFA' | 'IFB' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status category');
    } else {
      toast.success('Status category updated');
      fetchMonitoringData();
    }
  };

  const handleStatusDescriptionChange = async (id: string, value: string) => {
    if (!canEdit) return;

    const { error } = await supabase
      .from('monitoring_data')
      .update({ status_description: value as 'Not Yet' | 'In-Progress' | 'Complete' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status description');
    } else {
      toast.success('Status description updated');
      fetchMonitoringData();
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Monitoring</h1>
        {canEdit && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Status Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead>Target Submit (IFR)</TableHead>
              <TableHead>Target Submit (IFA)</TableHead>
              <TableHead>Target Submit (IFB)</TableHead>
              <TableHead>Actual Submit (IFR)</TableHead>
              <TableHead>Actual Submit (IFA)</TableHead>
              <TableHead>Actual Submit (IFB)</TableHead>
              <TableHead>Approval</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : monitoringData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              monitoringData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.file_name}</TableCell>
                  <TableCell>
                    <Select
                      value={item.status_category}
                      onValueChange={(value) => handleStatusCategoryChange(item.id, value)}
                      disabled={!canEdit}
                    >
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
                  <TableCell>
                    <Select
                      value={item.status_description}
                      onValueChange={(value) => handleStatusDescriptionChange(item.id, value)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Yet">Not Yet</SelectItem>
                        <SelectItem value="In-Progress">In-Progress</SelectItem>
                        <SelectItem value="Complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{item.pic || '-'}</TableCell>
                  <TableCell>{formatDate(item.target_submit_ifr)}</TableCell>
                  <TableCell>{formatDate(item.target_submit_ifa)}</TableCell>
                  <TableCell>{formatDate(item.target_submit_ifb)}</TableCell>
                  <TableCell>{formatDate(item.actual_submit_ifr)}</TableCell>
                  <TableCell>{formatDate(item.actual_submit_ifa)}</TableCell>
                  <TableCell>{formatDate(item.actual_submit_ifb)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.approval_status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : item.approval_status === 'Denied'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.approval_status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
