import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Project {
  id: string;
  project_name: string;
  description: string | null;
  status: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
}

export default function Limau() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    status: 'Active',
  });

  useEffect(() => {
    fetchProjects();
    fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data && !error) {
      setUserRole(data.role);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('limau_projects')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      toast.error('Failed to fetch projects');
      console.error(error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const canEdit = userRole === 'admin' || userRole === 'reviewer';
  const canDelete = userRole === 'admin';

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setSelectedProject(project);
      setFormData({
        project_name: project.project_name,
        description: project.description || '',
        status: project.status || 'Active',
      });
    } else {
      setSelectedProject(null);
      setFormData({
        project_name: '',
        description: '',
        status: 'Active',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.project_name.trim()) {
      toast.error('Project name is required');
      return;
    }

    if (selectedProject) {
      const updateData: Record<string, unknown> = {
        project_name: formData.project_name,
        description: formData.description || null,
        status: formData.status,
      };

      // Auto-fill finished_at when status is changed to Completed
      if (formData.status === 'Completed' && selectedProject.status !== 'Completed') {
        updateData.finished_at = new Date().toISOString();
      }
      // Clear finished_at if status is changed from Completed to something else
      if (formData.status !== 'Completed' && selectedProject.status === 'Completed') {
        updateData.finished_at = null;
      }

      const { error } = await supabase
        .from('limau_projects')
        .update(updateData)
        .eq('id', selectedProject.id);
      
      if (error) {
        toast.error('Failed to update project');
        console.error(error);
      } else {
        toast.success('Project updated successfully');
        fetchProjects();
      }
    } else {
      const { error } = await supabase
        .from('limau_projects')
        .insert({
          project_name: formData.project_name,
          description: formData.description || null,
          status: formData.status,
          created_by: user?.id,
        });
      
      if (error) {
        toast.error('Failed to create project');
        console.error(error);
      } else {
        toast.success('Project created successfully');
        fetchProjects();
      }
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    const { error } = await supabase
      .from('limau_projects')
      .delete()
      .eq('id', selectedProject.id);
    
    if (error) {
      toast.error('Failed to delete project');
      console.error(error);
    } else {
      toast.success('Project deleted successfully');
      fetchProjects();
    }
    setIsDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Limau Project List</h1>
            <p className="text-muted-foreground">Manage projects for Limau area</p>
          </div>
        </div>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name *</label>
                  <Input
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter project description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {selectedProject ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No projects found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Finish At</TableHead>
                    {(canEdit || canDelete) && <TableHead className="w-24">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project, index) => (
                    <TableRow 
                      key={project.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/limau/${project.id}`)}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium text-primary hover:underline">{project.project_name}</TableCell>
                      <TableCell className="max-w-xs truncate">{project.description || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          project.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {project.status}
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(project.created_at), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{project.finished_at ? format(new Date(project.finished_at), 'dd MMM yyyy') : '-'}</TableCell>
                      {(canEdit || canDelete) && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); handleOpenDialog(project); }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); openDeleteDialog(project); }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProject?.project_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
