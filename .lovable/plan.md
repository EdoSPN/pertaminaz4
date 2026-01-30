

## Plan: Add "Denied with Comment" Approval Status

### Overview
This plan adds a new "Denied with Comment" status to the Approval action, with conditional comment form visibility and clickable status display in the table to view comments.

---

### Database Changes

Add `Denied with Comment` to the `approval_status` enum:

```sql
ALTER TYPE approval_status ADD VALUE 'Denied with Comment';
```

---

### Implementation Details

#### 1. Update TypeScript Interface (Area2DocumentTracking.tsx)

**Line 43** - Add new status to approval_status type:

```typescript
// Change from:
approval_status: 'Approved' | 'Denied' | 'Pending';

// Change to:
approval_status: 'Approved' | 'Denied' | 'Pending' | 'Denied with Comment';
```

---

#### 2. Update State Type (Line 70)

```typescript
// Change from:
const [approvalStatus, setApprovalStatus] = useState<'Approved' | 'Denied' | 'Pending'>('Pending');

// Change to:
const [approvalStatus, setApprovalStatus] = useState<'Approved' | 'Denied' | 'Pending' | 'Denied with Comment'>('Pending');
```

---

#### 3. Add New State for Comment Popup

Add state to track which item's comment popup is open:

```typescript
const [commentDialogOpen, setCommentDialogOpen] = useState(false);
const [commentDialogItem, setCommentDialogItem] = useState<MonitoringData | null>(null);
```

---

#### 4. Update getApprovalStatusColor Function (Lines 517-523)

Add styling for the new status:

```typescript
const getApprovalStatusColor = (status: string) => {
  switch (status) {
    case 'Approved': return 'bg-green-100 text-green-800';
    case 'Denied': return 'bg-red-100 text-red-800';
    case 'Denied with Comment': return 'bg-orange-100 text-orange-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};
```

---

#### 5. Update Table Approval Status Cell (Lines 567-571)

Make the status clickable only when it's "Denied with Comment":

```typescript
<TableCell>
  {item.approval_status === 'Denied with Comment' ? (
    <button
      onClick={() => {
        setCommentDialogItem(item);
        setCommentDialogOpen(true);
      }}
      className={`px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity ${getApprovalStatusColor(item.approval_status)}`}
      title="Click to view comment"
    >
      {item.approval_status}
    </button>
  ) : (
    <span className={`px-2 py-1 rounded-full text-xs ${getApprovalStatusColor(item.approval_status)}`}>
      {item.approval_status}
    </span>
  )}
</TableCell>
```

---

#### 6. Update Approval Dialog (Lines 1115-1146)

Modify the dialog to conditionally show/hide the comment field:

```typescript
{/* Approval Dialog */}
<Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Update Approval Status</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label>Approval Status</Label>
        <Select 
          value={approvalStatus} 
          onValueChange={(value: 'Approved' | 'Denied' | 'Pending' | 'Denied with Comment') => {
            setApprovalStatus(value);
            // Clear comment if status is not "Denied with Comment"
            if (value !== 'Denied with Comment') {
              setApprovalComment('');
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Denied">Denied</SelectItem>
            <SelectItem value="Denied with Comment">Denied with Comment</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {approvalStatus === 'Denied with Comment' && (
        <div>
          <Label>Comment <span className="text-red-500">*</span></Label>
          <Textarea
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
            placeholder="Enter reason for denial..."
            className="min-h-[100px]"
          />
        </div>
      )}
      <Button onClick={handleSaveApproval} className="w-full">Save Changes</Button>
    </div>
  </DialogContent>
</Dialog>
```

---

#### 7. Update handleSaveApproval Function (Lines 314-341)

Add validation to require comment when status is "Denied with Comment":

```typescript
const handleSaveApproval = async () => {
  if (!currentEditItem) return;
  
  // Require comment when status is "Denied with Comment"
  if (approvalStatus === 'Denied with Comment' && !approvalComment.trim()) {
    toast.error('Comment is required for "Denied with Comment" status');
    return;
  }
  
  const validation = validateMonitoringData({
    file_name: currentEditItem.file_name,
    approval_comment: approvalStatus === 'Denied with Comment' ? approvalComment.trim() : null,
  });

  if (!validation.success) {
    toast.error(validation.error);
    return;
  }

  const { error } = await supabase
    .from('prabumulih_monitoring_data')
    .update({
      approval_status: approvalStatus,
      approval_comment: approvalStatus === 'Denied with Comment' ? validation.data.approval_comment : null,
    })
    .eq('id', currentEditItem.id);
  
  if (error) {
    toast.error('Failed to update approval status');
  } else {
    toast.success('Approval status updated successfully');
    setApprovalDialogOpen(false);
    setCurrentEditItem(null);
    setApprovalComment('');
    fetchMonitoringData();
  }
};
```

---

#### 8. Add Comment View Popup Dialog

Add a new dialog at the end of the component to view comments:

```typescript
{/* Comment View Dialog */}
<Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
          Denied with Comment
        </span>
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label className="text-muted-foreground">File Name</Label>
        <p className="font-medium">{commentDialogItem?.file_name}</p>
      </div>
      <div>
        <Label className="text-muted-foreground">Category</Label>
        <p className="font-medium">{commentDialogItem?.status_category}</p>
      </div>
      <div>
        <Label className="text-muted-foreground">Denial Comment</Label>
        <div className="mt-1 p-3 bg-slate-50 rounded-lg border">
          <p className="text-sm whitespace-pre-wrap">
            {commentDialogItem?.approval_comment || 'No comment provided'}
          </p>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

---

#### 9. Add Textarea Import

Add Textarea component import at the top of the file:

```typescript
import { Textarea } from '@/components/ui/textarea';
```

---

### Summary of Changes

| Location | Change |
|----------|--------|
| Database | Add `Denied with Comment` to `approval_status` enum |
| Line 10 (imports) | Add `Textarea` import |
| Line 43 (interface) | Add new status to type |
| Line 70 (state) | Update state type |
| After Line 88 (state) | Add `commentDialogOpen` and `commentDialogItem` states |
| Lines 314-341 (handler) | Update `handleSaveApproval` with validation logic |
| Lines 517-523 (helper) | Add orange color for new status |
| Lines 567-571 (table cell) | Make status clickable when "Denied with Comment" |
| Lines 1115-1146 (dialog) | Conditionally show comment field |
| After Line 1146 | Add Comment View Dialog |

---

### User Experience Flow

1. **Approver opens approval dialog** for any IFR/IFA/IFB row
2. **Selects "Denied with Comment"** from the dropdown
3. **Comment textarea appears** - must enter a reason
4. **Saves changes** - status updates to "Denied with Comment"
5. **In the table**, the "Denied with Comment" badge is now **clickable** (orange color)
6. **Any user clicks the status** and sees a popup with the denial comment
7. For **other statuses** (Approved, Denied, Pending):
   - Comment field is hidden in the approval dialog
   - Status badge in table is not clickable

