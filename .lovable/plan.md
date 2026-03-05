

## Plan: Enhanced Data Recap with Project Selection and Horizontal Scroll

### Overview
Three changes to the Data Recap dialog: (1) two-step view -- first show project list, then show filtered recap data, (2) make all table data single-line with horizontal scrolling, (3) add option to view all recap data.

### Changes in `src/pages/Area2DocumentTracking.tsx`

#### 1. New state for Data Recap project selection
- Add `recapSelectedProject` state (`string | null`, default `null`)
- When dialog opens, reset `recapSelectedProject` to `null` (show project list)
- When dialog closes, reset to `null`

#### 2. Data Recap dialog -- two-step UI

**Step 1 -- Project list view** (when `recapSelectedProject === null`):
- Show a list of project names from `filteredProjects` as clickable cards/buttons
- Add a "View All" button/option to show all data across all projects
- Clicking a project sets `recapSelectedProject` to that project's id
- Clicking "View All" sets `recapSelectedProject` to `'all'`

**Step 2 -- Recap table view** (when `recapSelectedProject` is set):
- Show a back button to return to project list
- Show the project name as subtitle (or "All Projects")
- Filter `getRecapData()` by selected project (or show all if `'all'`)
- Display the table with horizontal scroll

#### 3. Table formatting -- single line and horizontal scroll
- Add `whitespace-nowrap` to all `TableCell` and `TableHead` elements in the recap table
- Wrap the table in a `div` with `overflow-x-auto` so it scrolls horizontally
- Remove `overflow-auto` from `DialogContent` and instead scope it to the table container

#### 4. Updated `getRecapData` 
- Add optional `projectId` parameter to filter by project
- When `projectId` is provided (and not `'all'`), filter `monitoringData` to only that project's items before grouping

### Code sketch

```typescript
// New state
const [recapSelectedProject, setRecapSelectedProject] = useState<string | null>(null);

// Reset on dialog open/close
onOpenChange={(open) => {
  setRecapDialogOpen(open);
  if (!open) setRecapSelectedProject(null);
}}

// Inside DialogContent:
{recapSelectedProject === null ? (
  // Project selection view
  <div className="space-y-3 mt-4">
    <Button variant="outline" className="w-full" onClick={() => setRecapSelectedProject('all')}>
      View All Projects
    </Button>
    {filteredProjects.map(p => (
      <Button key={p.id} variant="outline" className="w-full justify-start"
        onClick={() => setRecapSelectedProject(p.id)}>
        {p.project_name}
      </Button>
    ))}
  </div>
) : (
  // Recap table view
  <div>
    <Button variant="ghost" size="sm" onClick={() => setRecapSelectedProject(null)}>
      ← Back to Projects
    </Button>
    <div className="overflow-x-auto mt-2">
      <Table>
        {/* whitespace-nowrap on all cells */}
      </Table>
    </div>
  </div>
)}
```

### Summary

| Change | Detail |
|--------|--------|
| New state | `recapSelectedProject` to track selected project in recap |
| Dialog flow | First shows project list, then filtered table on click |
| "View All" option | Shows all recap data across all projects |
| Table formatting | `whitespace-nowrap` on all cells, `overflow-x-auto` wrapper for horizontal scroll |
| Back navigation | Button to return from table view to project list |

Single file change: `src/pages/Area2DocumentTracking.tsx`

