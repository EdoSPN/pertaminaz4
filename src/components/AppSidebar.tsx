import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Calculator, 
  Database,
  Shield,
  LogOut,
  Monitor,
  ChevronRight
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Power BI Analysis', url: '/powerbi', icon: BarChart3 },
  { title: 'Unit Estimator', url: '/calculator', icon: Calculator },
  { title: 'Data Repository', url: '/repository', icon: Database },
  { title: 'Document Tracking', url: '#', icon: Monitor, isNested: true },
  { title: 'User Management', url: '/users', icon: Shield, adminOnly: true },
].sort((a, b) => a.title.localeCompare(b.title));

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [userRole, setUserRole] = useState<string>('');
  const [openDocTracking, setOpenDocTracking] = useState(true);

  useEffect(() => {
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

    fetchUserRole();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;
  const collapsed = state === 'collapsed';

  const visibleMenuItems = menuItems.filter(
    item => !item.adminOnly || userRole === 'admin'
  );

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'text-center' : ''}>
            {collapsed ? 'Menu' : 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                item.isNested ? (
                  collapsed ? (
                    <React.Fragment key={item.title}>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/area1/document-tracking')}>
                          <NavLink to="/area1/document-tracking" className="flex items-center justify-center">
                            <span className="h-4 w-4 flex items-center justify-center text-xs font-bold">A1</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/area2/document-tracking')}>
                          <NavLink to="/area2/document-tracking" className="flex items-center justify-center">
                            <span className="h-4 w-4 flex items-center justify-center text-xs font-bold">A2</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </React.Fragment>
                  ) : (
                    <Collapsible key={item.title} open={openDocTracking} onOpenChange={setOpenDocTracking} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={isActive('/area1/document-tracking')}>
                                <NavLink to="/area1/document-tracking">
                                  Area 1
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={isActive('/area2/document-tracking')}>
                                <NavLink to="/area2/document-tracking">
                                  Area 2
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start gap-3"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
