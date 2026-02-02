

## Plan: Add Discipline Dropdown Field to Area 2 Document Tracking

### Overview
This plan adds a new "Discipline" dropdown field to the Add Data form and displays it as abbreviated codes in the main table after the PIC column.

---

### Discipline Values and Abbreviations

| Full Name | Abbreviation |
|-----------|--------------|
| Process | PR |
| Process Safety | PS |
| Mechanical | ME |
| Electrical | EL |
| Instrument | IN |
| Piping | PI |
| Civil & Structure | CS |
| Project Management | PM |

---

### Database Changes

Add a new `discipline` column to the `prabumulih_monitoring_data` table:

```sql
ALTER TABLE prabumulih_monitoring_data 
ADD COLUMN discipline TEXT DEFAULT NULL;
```

---

### Implementation Details

#### 1. Add DisciplineType and Mapping Constants

Add type definition and abbreviation mapping at the top of the file (after line 25):

```typescript
type DisciplineType = 'Process' | 'Process Safety' | 'Mechanical' | 'Electrical' | 'Instrument' | 'Piping' | 'Civil & Structure' | 'Project Management';

const DISCIPLINE_ABBREVIATIONS: Record<DisciplineType, string> = {
  'Process': 'PR',
  'Process Safety': 'PS',
  'Mechanical': 'ME',
  'Electrical': 'EL',
  'Instrument': 'IN',
  'Piping': 'PI',
  'Civil & Structure': 'CS',
  'Project Management': 'PM',
};
```

---

#### 2. Update MonitoringData Interface (Line 27-46)

Add discipline field to the interface:

```typescript
interface MonitoringData {
  // ... existing fields
  discipline: DisciplineType | null;
}
```

---

#### 3. Add State for Discipline

Add new state variables (around line 86):

```typescript
const [discipline, setDiscipline] = useState<DisciplineType | null>(null);
const [editDiscipline, setEditDiscipline] = useState<DisciplineType | null>(null);
```

---

#### 4. Update Add Data Form (Lines 717-798)

Add Discipline dropdown after PIC field in the Add Data dialog:

```typescript
<div>
  <Label htmlFor="discipline">Discipline</Label>
  <Select 
    value={discipline || ''} 
    onValueChange={(value: DisciplineType) => setDiscipline(value)}
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select discipline" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Process">Process</SelectItem>
      <SelectItem value="Process Safety">Process Safety</SelectItem>
      <SelectItem value="Mechanical">Mechanical</SelectItem>
      <SelectItem value="Electrical">Electrical</SelectItem>
      <SelectItem value="Instrument">Instrument</SelectItem>
      <SelectItem value="Piping">Piping</SelectItem>
      <SelectItem value="Civil & Structure">Civil & Structure</SelectItem>
      <SelectItem value="Project Management">Project Management</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

#### 5. Update handleAddNew Function (Lines 368-438)

Include discipline in the insert data:

```typescript
{
  project_id: PROJECT_ID,
  field: field,
  file_name: validation.data.file_name,
  document_number: validation.data.document_number,
  pic: validation.data.pic,
  discipline: discipline,  // Add this
  status_category: 'IFR',
  // ... rest of fields
}
```

Also reset discipline state after successful add:

```typescript
setDiscipline(null);
```

---

#### 6. Update Table Header (Lines 957-970)

Add Discipline column after PIC:

```typescript
<TableHeader>
  <TableRow>
    <TableHead>Field</TableHead>
    <TableHead>Doc Number</TableHead>
    <TableHead>File Name</TableHead>
    <TableHead>Category</TableHead>
    <TableHead>Status</TableHead>
    <TableHead>PIC</TableHead>
    <TableHead>Discipline</TableHead>  {/* New column */}
    <TableHead>Target Date</TableHead>
    <TableHead>Actual Date</TableHead>
    <TableHead>Submit Status</TableHead>
    <TableHead>Approval</TableHead>
    <TableHead>Actions</TableHead>
  </TableRow>
</TableHeader>
```

---

#### 7. Update renderDataRows Function (Lines 545-643)

Add discipline cell after PIC, displaying the abbreviation:

```typescript
<TableCell>{group.pic || '-'}</TableCell>
<TableCell>
  {group.discipline ? DISCIPLINE_ABBREVIATIONS[group.discipline as DisciplineType] : '-'}
</TableCell>
<TableCell>{formatDate(targetDate)}</TableCell>
```

---

#### 8. Update groupedData Reducer (Lines 489-510)

Include discipline in the grouped data:

```typescript
const groupedData = monitoringData.reduce((acc, item) => {
  // ... existing filter logic
  if (!acc[item.file_name]) {
    acc[item.file_name] = {
      field: item.field || 'Prabumulih',
      file_name: item.file_name,
      document_number: item.document_number,
      pic: item.pic,
      discipline: item.discipline,  // Add this
      id: item.id,
      ifr: null as MonitoringData | null,
      ifa: null as MonitoringData | null,
      ifb: null as MonitoringData | null,
    };
  }
  // ... rest of reducer
}, {} as Record<string, { 
  field: string; 
  file_name: string; 
  document_number: string | null; 
  pic: string | null; 
  discipline: DisciplineType | null;  // Add this
  id: string; 
  ifr: MonitoringData | null; 
  ifa: MonitoringData | null; 
  ifb: MonitoringData | null 
}>);
```

---

#### 9. Update Edit File Info Dialog (Lines 1025-1120)

Add Discipline dropdown in the edit dialog for Admin and Reviewer:

```typescript
<div>
  <Label>Discipline</Label>
  <Select 
    value={editDiscipline || ''} 
    onValueChange={(value: DisciplineType) => setEditDiscipline(value)}
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select discipline" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Process">Process</SelectItem>
      <SelectItem value="Process Safety">Process Safety</SelectItem>
      <SelectItem value="Mechanical">Mechanical</SelectItem>
      <SelectItem value="Electrical">Electrical</SelectItem>
      <SelectItem value="Instrument">Instrument</SelectItem>
      <SelectItem value="Piping">Piping</SelectItem>
      <SelectItem value="Civil & Structure">Civil & Structure</SelectItem>
      <SelectItem value="Project Management">Project Management</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

#### 10. Update handleOpenReviewerEditDialog (Lines 205-218)

Set editDiscipline when opening dialog:

```typescript
setEditDiscipline(item.discipline || null);
```

---

#### 11. Update handleSaveReviewerEdit (Lines 254-315)

Include discipline in the common updates:

```typescript
const commonUpdates = {
  file_name: validation.data.file_name,
  pic: validation.data.pic,
  document_number: validation.data.document_number,
  field: editField,
  discipline: editDiscipline,  // Add this
};
```

---

#### 12. Update Data Recap Dialog (Lines 661-703)

Add Discipline column to recap table:

```typescript
<TableHeader>
  <TableRow>
    <TableHead>No</TableHead>
    <TableHead>Field</TableHead>
    <TableHead>Doc Number</TableHead>
    <TableHead>File Name</TableHead>
    <TableHead>PIC</TableHead>
    <TableHead>Discipline</TableHead>  {/* New column */}
    <TableHead>IFR</TableHead>
    <TableHead>IFA</TableHead>
    <TableHead>IFB</TableHead>
  </TableRow>
</TableHeader>
```

And update getRecapData function to include discipline.

---

### Summary of Changes

| Location | Change |
|----------|--------|
| Database | Add `discipline` column to `prabumulih_monitoring_data` table |
| Line 25 | Add `DisciplineType` type and `DISCIPLINE_ABBREVIATIONS` constant |
| Line 27-46 | Add `discipline` to MonitoringData interface |
| Line 86 | Add `discipline` and `editDiscipline` state variables |
| Lines 205-218 | Update `handleOpenReviewerEditDialog` to set discipline |
| Lines 254-315 | Update `handleSaveReviewerEdit` to include discipline |
| Lines 368-438 | Update `handleAddNew` to include discipline |
| Lines 456-479 | Update `getRecapData` to include discipline |
| Lines 489-510 | Update `groupedData` reducer to include discipline |
| Lines 545-643 | Update `renderDataRows` to display discipline abbreviation |
| Lines 661-703 | Update Data Recap table with Discipline column |
| Lines 717-798 | Add Discipline dropdown to Add Data form |
| Lines 957-970 | Add Discipline column header to main table |
| Lines 1025-1120 | Add Discipline dropdown to Edit File Info dialog |

---

### User Experience Flow

1. **Adding New Data**: User fills the Add Data form, selects a discipline from the dropdown (Process, Mechanical, etc.)
2. **Table Display**: The discipline appears as an abbreviation (PR, ME, etc.) in a new column after PIC
3. **Editing**: Admin and Reviewer can edit the discipline in the File Information dialog
4. **Data Recap**: The recap table also shows the discipline abbreviation

---

### Visual Example

**Add Data Form:**
```text
Field:       [Prabumulih     ▼]
File Name:   [________________]
Doc Number:  [________________]
PIC:         [Select or type PIC... ▼]
Discipline:  [Select discipline    ▼]
             - Process
             - Process Safety
             - Mechanical
             - Electrical
             - Instrument
             - Piping
             - Civil & Structure
             - Project Management
```

**Table Display:**
```text
| Field | Doc Number | File Name | Category | Status | PIC  | Discipline | Target | Actual | ...
|-------|------------|-----------|----------|--------|------|------------|--------|--------|
| Prabumulih | DOC-001 | Design A | IFR | Complete | John | ME | 01/02/2026 | ...
```

