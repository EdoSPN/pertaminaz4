import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';
import type { Enums } from '@/integrations/supabase/types';

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
};

type UserRole = {
  id: string;
  user_id: string;
  role: Enums<'app_role'>;
};

const UserManagement = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const availableRoles: Enums<'app_role'>[] = ['admin', 'reviewer', 'approver', 'viewer', 'user'];

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      if (!user) return;

      // Check if current user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        setIsAdmin(false);
        setLoading(false);
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      setIsAdmin(true);

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        toast.error('Failed to load users');
        setLoading(false);
        return;
      }

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        toast.error('Failed to load roles');
      }

      setProfiles(profilesData || []);
      setUserRoles(rolesData || []);
      setLoading(false);
    };

    checkAdminAndFetchData();
  }, [user]);

  const getUserRole = (userId: string) => {
    return userRoles.find(ur => ur.user_id === userId)?.role || 'none';
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const currentRole = userRoles.find(ur => ur.user_id === userId);

      if (newRole === 'none') {
        // Remove role
        if (currentRole) {
          const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('id', currentRole.id);

          if (error) throw error;

          setUserRoles(userRoles.filter(ur => ur.id !== currentRole.id));
          toast.success('Role removed successfully');
        }
      } else if (currentRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole as Enums<'app_role'> })
          .eq('id', currentRole.id);

        if (error) throw error;

        setUserRoles(userRoles.map(ur => 
          ur.id === currentRole.id ? { ...ur, role: newRole as Enums<'app_role'> } : ur
        ));
        toast.success('Role updated successfully');
      } else {
        // Insert new role
        const { data, error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: newRole as Enums<'app_role'> }])
          .select()
          .single();

        if (error) throw error;

        setUserRoles([...userRoles, data]);
        toast.success('Role assigned successfully');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'approver':
        return 'default';
      case 'reviewer':
        return 'secondary';
      case 'user':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
          <CardDescription>
            You need admin privileges to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          User Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage user roles and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Assign roles to users to control their access level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Assign Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => {
                  const currentRole = getUserRole(profile.id);
                  return (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {profile.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        {currentRole !== 'none' ? (
                          <Badge variant={getRoleBadgeVariant(currentRole)} className="capitalize">
                            {currentRole}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No role assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={currentRole}
                          onValueChange={(value) => handleRoleChange(profile.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Role</SelectItem>
                            {availableRoles.map((role) => (
                              <SelectItem key={role} value={role} className="capitalize">
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="destructive">Admin</Badge>
            <p className="text-sm text-muted-foreground">
              Full access to all features including user management and role assignment
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="default">Approver</Badge>
            <p className="text-sm text-muted-foreground">
              Can approve files and add comments in the repository
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="secondary">Reviewer</Badge>
            <p className="text-sm text-muted-foreground">
              Can review and update files in the repository
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline">User</Badge>
            <p className="text-sm text-muted-foreground">
              Can upload and manage their own files
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline">Viewer</Badge>
            <p className="text-sm text-muted-foreground">
              Read-only access to view content
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
