import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BarChart3, Upload, Save, Trash2, LineChart, AreaChart, ScatterChart as ScatterIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import Papa from 'papaparse';
import DataTable from '@/components/DataTable';
import DynamicChart from '@/components/DynamicChart';

type ChartType = 'line' | 'bar' | 'area' | 'scatter';

interface Dataset {
  id: string;
  name: string;
  columns: string[];
  data: Record<string, any>[];
  x_axis: string | null;
  y_axis: string | null;
  chart_type: string;
}

const PowerBI = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [datasetName, setDatasetName] = useState('');
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's saved datasets
  useEffect(() => {
    if (user) {
      fetchDatasets();
    }
  }, [user]);

  const fetchDatasets = async () => {
    const { data, error } = await supabase
      .from('chart_datasets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch datasets');
      return;
    }

    setDatasets(data.map(d => ({
      ...d,
      columns: d.columns as string[],
      data: d.data as Record<string, any>[]
    })));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cols = results.meta.fields || [];
        const data = results.data as Record<string, any>[];
        
        setColumns(cols);
        setParsedData(data);
        setDatasetName(file.name.replace('.csv', ''));
        setSelectedDatasetId('');
        setXAxis('');
        setYAxis('');
        
        toast.success(`Loaded ${data.length} rows with ${cols.length} columns`);
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadDataset = (datasetId: string) => {
    const dataset = datasets.find(d => d.id === datasetId);
    if (!dataset) return;

    setSelectedDatasetId(datasetId);
    setDatasetName(dataset.name);
    setColumns(dataset.columns);
    setParsedData(dataset.data);
    setXAxis(dataset.x_axis || '');
    setYAxis(dataset.y_axis || '');
    setChartType((dataset.chart_type as ChartType) || 'line');
  };

  const handleSaveDataset = async () => {
    if (!user) {
      toast.error('Please log in to save datasets');
      return;
    }

    if (!datasetName.trim()) {
      toast.error('Please enter a dataset name');
      return;
    }

    if (parsedData.length === 0) {
      toast.error('No data to save');
      return;
    }

    setIsLoading(true);

    const datasetPayload = {
      name: datasetName,
      columns,
      data: parsedData,
      x_axis: xAxis || null,
      y_axis: yAxis || null,
      chart_type: chartType,
      created_by: user.id
    };

    let error;

    if (selectedDatasetId) {
      // Update existing
      const result = await supabase
        .from('chart_datasets')
        .update(datasetPayload)
        .eq('id', selectedDatasetId);
      error = result.error;
    } else {
      // Create new
      const result = await supabase
        .from('chart_datasets')
        .insert(datasetPayload)
        .select()
        .single();
      error = result.error;
      if (!error && result.data) {
        setSelectedDatasetId(result.data.id);
      }
    }

    setIsLoading(false);

    if (error) {
      toast.error('Failed to save dataset');
      return;
    }

    toast.success('Dataset saved successfully');
    fetchDatasets();
  };

  const handleDeleteDataset = async () => {
    if (!selectedDatasetId) return;

    setIsLoading(true);

    const { error } = await supabase
      .from('chart_datasets')
      .delete()
      .eq('id', selectedDatasetId);

    setIsLoading(false);

    if (error) {
      toast.error('Failed to delete dataset');
      return;
    }

    toast.success('Dataset deleted');
    setSelectedDatasetId('');
    setDatasetName('');
    setColumns([]);
    setParsedData([]);
    setXAxis('');
    setYAxis('');
    fetchDatasets();
  };

  const handleDataChange = (newData: Record<string, any>[]) => {
    setParsedData(newData);
  };

  const handleAddRow = () => {
    const newRow: Record<string, any> = {};
    columns.forEach(col => {
      newRow[col] = '';
    });
    setParsedData([...parsedData, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    setParsedData(parsedData.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Data Analysis
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload CSV files and create interactive charts with live editing
        </p>
      </div>

      {/* Dataset Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset</CardTitle>
          <CardDescription>Upload a new CSV or load a saved dataset</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </label>
              </Button>
            </div>

            <Select value={selectedDatasetId} onValueChange={handleLoadDataset}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Load saved dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="dataset-name">Dataset Name</Label>
              <Input
                id="dataset-name"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="Enter dataset name"
              />
            </div>
            <Button onClick={handleSaveDataset} disabled={isLoading || !parsedData.length}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            {selectedDatasetId && (
              <Button variant="destructive" onClick={handleDeleteDataset} disabled={isLoading}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart Configuration */}
      {columns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chart Configuration</CardTitle>
            <CardDescription>Select axes and chart type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="space-y-2">
                <Label>X-Axis</Label>
                <Select value={xAxis} onValueChange={setXAxis}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Y-Axis</Label>
                <Select value={yAxis} onValueChange={setYAxis}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chart Type</Label>
                <ToggleGroup 
                  type="single" 
                  value={chartType} 
                  onValueChange={(value) => value && setChartType(value as ChartType)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="line" aria-label="Line chart">
                    <LineChart className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="bar" aria-label="Bar chart">
                    <BarChart3 className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="area" aria-label="Area chart">
                    <AreaChart className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="scatter" aria-label="Scatter chart">
                    <ScatterIcon className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table and Chart */}
      {columns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>Double-click cells to edit</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={parsedData}
                columns={columns}
                xAxis={xAxis}
                yAxis={yAxis}
                onDataChange={handleDataChange}
                onAddRow={handleAddRow}
                onDeleteRow={handleDeleteRow}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart</CardTitle>
              <CardDescription>
                {xAxis && yAxis ? `${xAxis} vs ${yAxis}` : 'Configure axes to view chart'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicChart
                data={parsedData}
                xAxis={xAxis}
                yAxis={yAxis}
                chartType={chartType}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {columns.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Data Loaded</h3>
              <p className="text-sm">
                Upload a CSV file or select a saved dataset to get started
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PowerBI;
