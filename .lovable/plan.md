

## Plan: Add "A1" and "A2" Text Icons for Collapsed Sidebar

### Overview
When the sidebar is collapsed, the nested Document Tracking sub-items (Area 1 and Area 2) are hidden. Show them as top-level icon-only menu items with text badges "A1" and "A2" when collapsed.

### Changes in `src/components/AppSidebar.tsx`

When `collapsed` is true, instead of rendering the nested collapsible structure for Document Tracking, render two simple `SidebarMenuItem` entries:

- **A1** -- links to the first Area 1 sub-item (e.g., `/monitoring/adera`) with a small styled `<span>` showing "A1" as the icon
- **A2** -- links to `/area2/document-tracking` with a `<span>` showing "A2"

The text icons will be styled as small bold text spans (`h-4 w-4 flex items-center justify-center text-xs font-bold`) to visually match the Lucide icon size.

When the sidebar is expanded, the existing nested collapsible structure remains unchanged.

#### Code approach

Inside the `item.isNested` branch (line 102), wrap the existing collapsible in `{!collapsed && (...)}` and add:

```typescript
{collapsed && (
  <>
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
  </>
)}
```

### Summary

| File | Change |
|------|--------|
| `src/components/AppSidebar.tsx` | Show "A1" and "A2" as clickable icon items when sidebar is collapsed; keep existing nested structure when expanded |

Single file change. No database changes.

