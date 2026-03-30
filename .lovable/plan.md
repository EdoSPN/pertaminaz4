

## Plan: Show "A1" and "A2" Icons When Sidebar is Collapsed

### Overview
When the sidebar is collapsed, replace the single Document Tracking collapsible with two separate menu items showing "A1" and "A2" text icons.

### Changes in `src/components/AppSidebar.tsx`

Replace the `item.isNested` branch (lines 102-158) with a conditional:

**When collapsed:** Render two `SidebarMenuItem` entries with text-based icons "A1" and "A2", linking to `/monitoring/adera` and `/area2/document-tracking` respectively.

**When expanded:** Keep the existing nested collapsible structure unchanged.

```typescript
item.isNested ? (
  collapsed ? (
    <React.Fragment key={item.title}>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={location.pathname.startsWith('/monitoring/')}>
          <NavLink to="/monitoring/adera" className="flex items-center justify-center">
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
    // existing Collapsible structure stays as-is
  )
)
```

Single file change, no database changes.

