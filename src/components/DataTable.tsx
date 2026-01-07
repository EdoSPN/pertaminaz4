import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps {
  data: Record<string, any>[];
  columns: string[];
  xAxis: string;
  yAxis: string;
  onDataChange: (newData: Record<string, any>[]) => void;
  onAddRow: () => void;
  onDeleteRow: (index: number) => void;
}

const DataTable = ({ 
  data, 
  columns, 
  xAxis, 
  yAxis, 
  onDataChange, 
  onAddRow, 
  onDeleteRow 
}: DataTableProps) => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleCellDoubleClick = (rowIndex: number, column: string, value: any) => {
    setEditingCell({ row: rowIndex, col: column });
    setEditValue(value?.toString() || '');
  };

  const handleCellSave = () => {
    if (!editingCell) return;
    
    const newData = [...data];
    const parsedValue = !isNaN(Number(editValue)) && editValue !== '' 
      ? Number(editValue) 
      : editValue;
    newData[editingCell.row] = {
      ...newData[editingCell.row],
      [editingCell.col]: parsedValue
    };
    onDataChange(newData);
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      handleCellSave();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const getColumnClass = (column: string) => {
    if (column === xAxis) return 'bg-blue-500/10 border-blue-500/30';
    if (column === yAxis) return 'bg-green-500/10 border-green-500/30';
    return '';
  };

  if (columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Upload a CSV file to see data
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ScrollArea className="h-[400px] border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              {columns.map((column) => (
                <TableHead 
                  key={column} 
                  className={cn("min-w-[100px]", getColumnClass(column))}
                >
                  <div className="flex items-center gap-1">
                    {column}
                    {column === xAxis && (
                      <span className="text-xs text-blue-500 font-normal">(X)</span>
                    )}
                    {column === yAxis && (
                      <span className="text-xs text-green-500 font-normal">(Y)</span>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="text-center text-muted-foreground text-xs">
                  {rowIndex + 1}
                </TableCell>
                {columns.map((column) => (
                  <TableCell 
                    key={column} 
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      getColumnClass(column)
                    )}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, column, row[column])}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === column ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleCellSave}
                        onKeyDown={handleKeyDown}
                        className="h-7 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm">{row[column]?.toString() || ''}</span>
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDeleteRow(rowIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <Button variant="outline" size="sm" onClick={onAddRow} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Row
      </Button>
    </div>
  );
};

export default DataTable;
