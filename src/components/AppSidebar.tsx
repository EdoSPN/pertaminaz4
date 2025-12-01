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
import { useEffect, useState } from 'react';
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
  { title: 'User Management', url: '/users', icon: Shield, adminOnly: true },
];

const documentTrackingItems = [
  { 
    title: 'Area 1', 
    items: [] 
  },
  { 
    title: 'Area 2', 
    items: [
      { title: 'Limau', url: '/monitoring/limau' },
      { title: 'Prabumulih', url: '/monitoring' }
    ].sort((a, b) => a.title.localeCompare(b.title))
  }
].sort((a, b) => a.title.localeCompare(b.title));

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [userRole, setUserRole] = useState<string>('');
  const [openDocTracking, setOpenDocTracking] = useState(true);
  const [openArea2, setOpenArea2] = useState(true);

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
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Document Tracking with nested structure */}
              <Collapsible open={openDocTracking} onOpenChange={setOpenDocTracking} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3">
                      <Monitor className="h-4 w-4" />
                      {!collapsed && <span>Document Tracking</span>}
                      {!collapsed && (
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {documentTrackingItems.map((area) => (
                        area.items.length === 0 ? (
                          <SidebarMenuSubItem key={area.title}>
                            <SidebarMenuSubButton>
                              {area.title}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ) : (
                          <Collapsible key={area.title} open={openArea2} onOpenChange={setOpenArea2} className="group/area">
                            <SidebarMenuSubItem>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuSubButton className="flex items-center gap-2">
                                  {area.title}
                                  <ChevronRight className="ml-auto h-3 w-3 transition-transform group-data-[state=open]/area:rotate-90" />
                                </SidebarMenuSubButton>
                              </CollapsibleTrigger>
                            </SidebarMenuSubItem>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {area.items.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                                      <NavLink to={subItem.url}>
                                        {subItem.title}
                                      </NavLink>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        )
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
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
