

## Plan: Add "Start Ticket" Feature to Area 2 Document Tracking

### Overview
Add a "Start Ticket" button to the Edit Status dialog that initiates a document's work phase. When clicked, it sets the status to "Start" and auto-fills the Actual Start date. After 1 day, a background job automatically transitions the status from "Start" to "In-Progress".

---

### Summary of Changes

| Change | Description |
|--------|-------------|
| Database enum | Add "Start" to the `status_description` enum |
| Edit Status dialog | Add "Start Ticket" button, disable fields when status is "Not Yet" |
| Status colors | Add color styling for the new "Start" status |
| Edge function | Create `update-start-status` function to auto-transition "Start" to "In-Progress" after 1 day |
| Cron job | Schedule the edge function to run every hour |

---

### Database Changes

#### 1. Add "Start" to status_description enum

```sql
ALTER TYPE status_description ADD VALUE 'Start' AFTER 'Not Yet';
```

This adds "Start" as a valid status value between "Not Yet" and "In-Progress".

---

### Frontend Changes (src/pages/Area2DocumentTracking.tsx)

#### 2. Update MonitoringData interface

Update the status type unions to include "Start":

```typescript
status_description_ifr: 'Not Yet' | 'Start' | 'In-Progress' | 'Complete';
status_description_ifa: 'Not Yet' | 'Start' | 'In-Progress' | 'Complete';
status_description_ifb: 'Not Yet' | 'Start' | 'In-Progress' | 'Complete';
```

#### 3. Update editStatusDescription state type

```typescript
const [editStatusDescription, setEditStatusDescription] = 
  useState<'Not Yet' | 'Start' | 'In-Progress' | 'Complete'>('Not Yet');
```

#### 4. Add Start Ticket confirmation state

```typescript
const [startTicketConfirmOpen, setStartTicketConfirmOpen] = useState(false);
```

#### 5. Add handleStartTicket function

This function will:
- Set the status to "Start" for the current category (IFR/IFA/IFB)
- Set the actual start date to the current date/time
- Save to the database
- Close the dialog and refresh data

```typescript
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
```

#### 6. Modify Edit Status Dialog

The dialog behavior changes based on the current status:

**When status is "Not Yet":**
- Status dropdown: disabled (greyed out), shows "Not Yet"
- Actual Start Date: disabled (greyed out)
- Actual Submit Date: disabled (greyed out)
- "Start Ticket" button: enabled and prominent (green/blue)
- "Save Changes" button: hidden or disabled

**When status is "Start", "In-Progress", or "Complete":**
- All fields work normally as before (editable)
- "Start Ticket" button: hidden (already started)
- "Save Changes" button: visible and enabled

```typescript
{/* Edit Status Dialog */}
<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Status - {currentEditItem?.status_category}</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label>Status Description</Label>
        <Select 
          value={editStatusDescription} 
          onValueChange={...} 
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
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
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
```

#### 7. Update getStatusColor function

Add styling for the "Start" status:

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Complete': return 'bg-green-100 text-green-800';
    case 'In-Progress': return 'bg-yellow-100 text-yellow-800';
    case 'Start': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
```

---

### Backend: Auto-Transition Cron Job

#### 8. Create Edge Function: `update-start-status`

This edge function will:
- Query all `prabumulih_monitoring_data` rows where any status_description is "Start"
- Check if the corresponding actual_start date is older than 1 day
- If so, update the status from "Start" to "In-Progress"

File: `supabase/functions/update-start-status/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Update IFR: Start -> In-Progress where actual_start_ifr is > 1 day old
  await supabase.from('prabumulih_monitoring_data')
    .update({ status_description_ifr: 'In-Progress' })
    .eq('status_description_ifr', 'Start')
    .lt('actual_start_ifr', oneDayAgo);

  // Update IFA
  await supabase.from('prabumulih_monitoring_data')
    .update({ status_description_ifa: 'In-Progress' })
    .eq('status_description_ifa', 'Start')
    .lt('actual_start_ifa', oneDayAgo);

  // Update IFB
  await supabase.from('prabumulih_monitoring_data')
    .update({ status_description_ifb: 'In-Progress' })
    .eq('status_description_ifb', 'Start')
    .lt('actual_start_ifb', oneDayAgo);

  return new Response(
    JSON.stringify({ message: 'Status updates complete' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
```

#### 9. Update supabase/config.toml

```toml
project_id = "ntidqouotifrxgmxrqmr"

[functions.update-start-status]
verify_jwt = false
```

#### 10. Set up Cron Job

Enable the required extensions and schedule the cron job to run every hour:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule hourly check
SELECT cron.schedule(
  'update-start-status-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ntidqouotifrxgmxrqmr.supabase.co/functions/v1/update-start-status',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

### User Flow

```text
1. User opens Edit Status for a document with status "Not Yet"
2. Status dropdown, Actual Start, and Actual Submit fields are greyed out
3. User clicks "Start Ticket" button
4. Confirmation dialog appears explaining what will happen
5. User clicks "Confirm"
6. Status changes to "Start", Actual Start is set to today's date
7. After 1 day, the background job automatically changes status to "In-Progress"
8. User can then edit status normally (In-Progress, Complete, etc.)
```

---

### Files Modified

| File | Changes |
|------|---------|
| Database migration | Add "Start" to `status_description` enum |
| `src/pages/Area2DocumentTracking.tsx` | Update interface, Edit Status dialog, add Start Ticket button with confirmation, update status colors |
| `supabase/functions/update-start-status/index.ts` | New edge function for auto-transitioning Start to In-Progress |
| `supabase/config.toml` | Add edge function configuration |
| Cron job (via SQL insert) | Schedule hourly execution of the edge function |

