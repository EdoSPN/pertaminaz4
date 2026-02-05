

## Plan: Add Target Start and Actual Start Fields to Area 2 Document Tracking

### Overview
This plan adds new "Target Start" and "Actual Start" fields for IFR, IFA, and IFB categories. It also renames existing table column headers and adds new columns to display the start dates.

---

### Summary of Changes

| Change | Description |
|--------|-------------|
| Database | Add 6 new columns: `target_start_ifr`, `target_start_ifa`, `target_start_ifb`, `actual_start_ifr`, `actual_start_ifa`, `actual_start_ifb` |
| Form Labels | Add "Target Start" date pickers above "Target Submit" for each IFR, IFA, IFB |
| Table Headers | Rename "Target Date" to "Target Submit" and "Actual Date" to "Actual Submit" |
| Table Columns | Add "Target Start" and "Actual Start" columns after DISC |

---

### Database Changes

Add new columns to the `prabumulih_monitoring_data` table:

```sql
ALTER TABLE prabumulih_monitoring_data 
ADD COLUMN target_start_ifr TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN target_start_ifa TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN target_start_ifb TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN actual_start_ifr TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN actual_start_ifa TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN actual_start_ifb TIMESTAMP WITH TIME ZONE DEFAULT NULL;
```

---

### Implementation Details

#### 1. Update MonitoringData Interface

Add new fields to the interface (around line 39):

```typescript
interface MonitoringData {
  // ... existing fields
  target_start_ifr: string | null;
  target_start_ifa: string | null;
  target_start_ifb: string | null;
  actual_start_ifr: string | null;
  actual_start_ifa: string | null;
  actual_start_ifb: string | null;
}
```

---

#### 2. Add State Variables for Add Data Form

Add new state variables (around line 90-95):

```typescript
// Target Start dates
const [targetStartDate, setTargetStartDate] = useState<Date>();
const [targetStartDateIFA, setTargetStartDateIFA] = useState<Date>();
const [targetStartDateIFB, setTargetStartDateIFB] = useState<Date>();

// For Edit dialog
const [editTargetStartDate, setEditTargetStartDate] = useState<Date>();
const [editActualStartDate, setEditActualStartDate] = useState<string>('');
```

---

#### 3. Update Add Data Form (Lines 850-924)

Add "Target Start" date pickers ABOVE the existing "Target Submit" fields:

**Current order:**
- Target Submit IFR
- Target Submit IFA
- Target Submit IFB

**New order:**
- Target Start IFR
- Target Submit IFR
- Target Start IFA
- Target Submit IFA
- Target Start IFB
- Target Submit IFB

Example for IFR:
```typescript
<div>
  <Label>Target Start IFR</Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !targetStartDate && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {targetStartDate ? format(targetStartDate, 'dd/MM/yyyy') : "Pick a date"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar
        mode="single"
        selected={targetStartDate}
        onSelect={setTargetStartDate}
        initialFocus
      />
    </PopoverContent>
  </Popover>
</div>
<div>
  <Label>Target Submit IFR</Label>
  {/* existing Target Submit IFR picker */}
</div>
```

---

#### 4. Update handleAddNew Function (Lines 403-442)

Include target start dates in the insert data:

```typescript
{
  project_id: PROJECT_ID,
  // ... existing fields
  target_start_ifr: targetStartDate ? targetStartDate.toISOString() : null,
  target_start_ifa: targetStartDateIFA ? targetStartDateIFA.toISOString() : null,
  target_start_ifb: targetStartDateIFB ? targetStartDateIFB.toISOString() : null,
  target_submit_ifr: targetSubmitDate ? targetSubmitDate.toISOString() : null,
  // ... rest of fields
}
```

Also reset new state after successful add:

```typescript
setTargetStartDate(undefined);
setTargetStartDateIFA(undefined);
setTargetStartDateIFB(undefined);
```

---

#### 5. Update Table Headers (Lines 1008-1022)

Change:
```typescript
<TableHead>Target Date</TableHead>
<TableHead>Actual Date</TableHead>
```

To:
```typescript
<TableHead>Target Start</TableHead>
<TableHead>Actual Start</TableHead>
<TableHead>Target Submit</TableHead>
<TableHead>Actual Submit</TableHead>
```

New column order after DISC:
| DISC | Target Start | Actual Start | Target Submit | Actual Submit | Submit Status | Approval | Actions |

---

#### 6. Update renderDataRows Function (Lines 568-669)

Add logic to get target/actual start dates:

```typescript
const targetStartDate = item.status_category === 'IFR' 
  ? item.target_start_ifr 
  : item.status_category === 'IFA' 
  ? item.target_start_ifa 
  : item.target_start_ifb;

const actualStartDate = item.status_category === 'IFR' 
  ? item.actual_start_ifr 
  : item.status_category === 'IFA' 
  ? item.actual_start_ifa 
  : item.actual_start_ifb;
```

Add new cells after DISC:
```typescript
<TableCell>
  {group.discipline ? DISCIPLINE_ABBREVIATIONS[group.discipline] : '-'}
</TableCell>
<TableCell>{formatDate(targetStartDate)}</TableCell>
<TableCell>{formatDate(actualStartDate)}</TableCell>
<TableCell>{formatDate(targetDate)}</TableCell>
<TableCell>{formatDate(actualDate)}</TableCell>
```

---

#### 7. Update Edit Status Dialog (Lines 1044-1075)

Add "Actual Start Date" field:

```typescript
<div>
  <Label>Actual Start Date</Label>
  <Input
    type="date"
    value={editActualStartDate}
    onChange={(e) => setEditActualStartDate(e.target.value)}
  />
</div>
<div>
  <Label>Actual Submit Date</Label>
  <Input
    type="date"
    value={editActualSubmit}
    onChange={(e) => setEditActualSubmit(e.target.value)}
  />
</div>
```

---

#### 8. Update handleOpenEditDialog (Lines 203-218)

Set actual start date when opening dialog:

```typescript
const actualStartDate = item.status_category === 'IFR' 
  ? item.actual_start_ifr 
  : item.status_category === 'IFA' 
  ? item.actual_start_ifa 
  : item.actual_start_ifb;
setEditActualStartDate(actualStartDate ? format(new Date(actualStartDate), 'yyyy-MM-dd') : '');
```

---

#### 9. Update handleSaveEdit (Lines 243-268)

Include actual start date in updates:

```typescript
if (currentEditItem.status_category === 'IFR') {
  updates.status_description_ifr = editStatusDescription;
  updates.actual_start_ifr = editActualStartDate ? new Date(editActualStartDate).toISOString() : null;
  updates.actual_submit_ifr = editActualSubmit ? new Date(editActualSubmit).toISOString() : null;
} else if (currentEditItem.status_category === 'IFA') {
  updates.status_description_ifa = editStatusDescription;
  updates.actual_start_ifa = editActualStartDate ? new Date(editActualStartDate).toISOString() : null;
  updates.actual_submit_ifa = editActualSubmit ? new Date(editActualSubmit).toISOString() : null;
} else {
  updates.status_description_ifb = editStatusDescription;
  updates.actual_start_ifb = editActualStartDate ? new Date(editActualStartDate).toISOString() : null;
  updates.actual_submit_ifb = editActualSubmit ? new Date(editActualSubmit).toISOString() : null;
}
```

---

#### 10. Update Edit File Info Dialog (Lines 1182-1206)

Add "Target Start Date" picker above "Target Submit Date":

```typescript
<div>
  <Label>Target Start Date ({currentEditItem?.status_category})</Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !editTargetStartDate && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {editTargetStartDate ? format(editTargetStartDate, 'dd/MM/yyyy') : "Pick a date"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar
        mode="single"
        selected={editTargetStartDate}
        onSelect={setEditTargetStartDate}
        initialFocus
      />
    </PopoverContent>
  </Popover>
</div>
<div>
  <Label>Target Submit Date ({currentEditItem?.status_category})</Label>
  {/* existing Target Submit picker */}
</div>
```

---

#### 11. Update handleOpenReviewerEditDialog (Lines 220-234)

Set target start date when opening dialog:

```typescript
const targetStartDate = item.status_category === 'IFR' 
  ? item.target_start_ifr 
  : item.status_category === 'IFA' 
  ? item.target_start_ifa 
  : item.target_start_ifb;
setEditTargetStartDate(targetStartDate ? new Date(targetStartDate) : undefined);
```

---

#### 12. Update handleSaveReviewerEdit (Lines 270-332)

Include target start date in category updates:

```typescript
const categoryUpdate: Record<string, unknown> = {};
if (currentEditItem.status_category === 'IFR') {
  categoryUpdate.target_start_ifr = editTargetStartDate ? editTargetStartDate.toISOString() : null;
  categoryUpdate.target_submit_ifr = editTargetSubmitDate ? editTargetSubmitDate.toISOString() : null;
} else if (currentEditItem.status_category === 'IFA') {
  categoryUpdate.target_start_ifa = editTargetStartDate ? editTargetStartDate.toISOString() : null;
  categoryUpdate.target_submit_ifa = editTargetSubmitDate ? editTargetSubmitDate.toISOString() : null;
} else {
  categoryUpdate.target_start_ifb = editTargetStartDate ? editTargetStartDate.toISOString() : null;
  categoryUpdate.target_submit_ifb = editTargetSubmitDate ? editTargetSubmitDate.toISOString() : null;
}
```

---

### Visual Changes

**Add Data Form (new field order):**
```text
Field:           [Prabumulih     ▼]
File Name:       [________________]
Doc Number:      [________________]
PIC:             [Select or type PIC... ▼]
Discipline:      [Select discipline    ▼]
Target Start IFR:   [Pick a date        📅]
Target Submit IFR:  [Pick a date        📅]
Target Start IFA:   [Pick a date        📅]
Target Submit IFA:  [Pick a date        📅]
Target Start IFB:   [Pick a date        📅]
Target Submit IFB:  [Pick a date        📅]
```

**Table Headers (new order):**
```text
| Field | Doc Number | File Name | Category | Status | PIC | DISC | Target Start | Actual Start | Target Submit | Actual Submit | Submit Status | Approval | Actions |
```

---

### Files Modified

| File | Changes |
|------|---------|
| Database migration | Add 6 new columns for target/actual start dates |
| `src/pages/Area2DocumentTracking.tsx` | Update interface, states, form, table, and save handlers |

