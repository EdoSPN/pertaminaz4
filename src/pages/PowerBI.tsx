import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3 } from 'lucide-react';

const PowerBI = () => {
  const [selectedReport, setSelectedReport] = useState('dashboard');

  const reports = [
    {
      id: 'dashboard',
      name: 'Main Dashboard',
      description: 'Overview of key metrics and KPIs',
    },
    {
      id: 'sales',
      name: 'Sales Analytics',
      description: 'Sales performance and trends',
    },
    {
      id: 'inventory',
      name: 'Inventory Report',
      description: 'Stock levels and inventory management',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Power BI Analysis
        </h1>
        <p className="text-muted-foreground mt-2">
          View and analyze embedded Power BI dashboards
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Report</CardTitle>
          <CardDescription>Choose a Power BI report to view</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reports.map((report) => (
                <SelectItem key={report.id} value={report.id}>
                  {report.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{reports.find(r => r.id === selectedReport)?.name}</CardTitle>
          <CardDescription>
            {reports.find(r => r.id === selectedReport)?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full rounded-lg border bg-muted/50 p-8 text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Power BI Dashboard Placeholder</p>
            <p className="text-sm text-muted-foreground mt-2">
              Replace this section with your Power BI embed code
            </p>
            <div className="mt-4 p-4 bg-background rounded text-left text-xs">
              <code className="block">
                {`<iframe 
  title="PowerBI Dashboard" 
  width="100%" 
  height="600" 
  src="https://app.powerbi.com/reportEmbed?reportId=YOUR_REPORT_ID&autoAuth=true&ctid=YOUR_TENANT_ID" 
  frameBorder="0" 
  allowFullScreen="true">
</iframe>`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PowerBI;
