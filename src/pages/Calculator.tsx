import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator as CalcIcon, Download, RotateCcw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Calculator = () => {
  const [units, setUnits] = useState('');
  const [goodsType, setGoodsType] = useState('');
  const [usagePerUnit, setUsagePerUnit] = useState('');
  const [results, setResults] = useState<any>(null);

  const goodsTypes = [
    { id: 'paper', name: 'Paper (Reams)', multiplier: 1 },
    { id: 'pens', name: 'Pens (Boxes)', multiplier: 12 },
    { id: 'toner', name: 'Toner Cartridges', multiplier: 1 },
    { id: 'notebooks', name: 'Notebooks', multiplier: 1 },
  ];

  const calculateTotal = () => {
    if (!units || !goodsType || !usagePerUnit) return;

    const numUnits = parseFloat(units);
    const usage = parseFloat(usagePerUnit);
    const type = goodsTypes.find(g => g.id === goodsType);
    
    if (!type) return;

    const totalRequired = numUnits * usage;
    const totalWithBuffer = totalRequired * 1.1; // 10% buffer

    setResults({
      unitsCount: numUnits,
      goodsType: type.name,
      usagePerUnit: usage,
      totalRequired,
      totalWithBuffer,
      buffer: totalWithBuffer - totalRequired,
    });
  };

  const handleReset = () => {
    setUnits('');
    setGoodsType('');
    setUsagePerUnit('');
    setResults(null);
  };

  const handleDownload = () => {
    if (!results) return;
    
    const content = `
Unit Goods Estimation Report
============================
Date: ${new Date().toLocaleDateString()}

Input Parameters:
- Number of Units: ${results.unitsCount}
- Type of Goods: ${results.goodsType}
- Usage per Unit: ${results.usagePerUnit}

Calculations:
- Total Required: ${results.totalRequired.toFixed(2)}
- Safety Buffer (10%): ${results.buffer.toFixed(2)}
- Total with Buffer: ${results.totalWithBuffer.toFixed(2)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estimation-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalcIcon className="h-8 w-8" />
          Unit Goods Estimator
        </h1>
        <p className="text-muted-foreground mt-2">
          Calculate unit goods requirements and estimates
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Enter your estimation requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="units">Number of Units</Label>
              <Input
                id="units"
                type="number"
                placeholder="Enter number of units"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                min="0"
                step="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goodsType">Type of Goods</Label>
              <Select value={goodsType} onValueChange={setGoodsType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goods type" />
                </SelectTrigger>
                <SelectContent>
                  {goodsTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage">Estimated Usage per Unit</Label>
              <Input
                id="usage"
                type="number"
                placeholder="Enter usage per unit"
                value={usagePerUnit}
                onChange={(e) => setUsagePerUnit(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateTotal} className="flex-1">
                Calculate
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Calculation Results</CardTitle>
              <CardDescription>Estimated requirements summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Units</TableCell>
                    <TableCell className="text-right">{results.unitsCount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Goods Type</TableCell>
                    <TableCell className="text-right">{results.goodsType}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Usage/Unit</TableCell>
                    <TableCell className="text-right">{results.usagePerUnit}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Required</TableCell>
                    <TableCell className="text-right">{results.totalRequired.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Safety Buffer (10%)</TableCell>
                    <TableCell className="text-right">{results.buffer.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Total with Buffer</TableCell>
                    <TableCell className="text-right font-bold">
                      {results.totalWithBuffer.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Button onClick={handleDownload} className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Calculator;
