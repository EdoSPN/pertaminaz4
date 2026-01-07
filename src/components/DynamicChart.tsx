import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

type ChartType = 'line' | 'bar' | 'area' | 'scatter';

interface DynamicChartProps {
  data: Record<string, any>[];
  xAxis: string;
  yAxis: string;
  chartType: ChartType;
}

const DynamicChart = ({ data, xAxis, yAxis, chartType }: DynamicChartProps) => {
  const chartData = useMemo(() => {
    if (!xAxis || !yAxis || data.length === 0) return [];
    
    return data
      .filter(row => row[xAxis] !== undefined && row[yAxis] !== undefined)
      .map(row => ({
        [xAxis]: row[xAxis],
        [yAxis]: typeof row[yAxis] === 'number' ? row[yAxis] : Number(row[yAxis]) || 0
      }));
  }, [data, xAxis, yAxis]);

  const chartConfig = useMemo(() => ({
    [yAxis]: {
      label: yAxis,
      color: 'hsl(var(--primary))',
    },
  }), [yAxis]);

  if (!xAxis || !yAxis) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground border rounded-lg">
        Select X and Y axes to display chart
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground border rounded-lg">
        No valid data to display
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line 
              type="monotone" 
              dataKey={yAxis} 
              stroke="var(--color-primary)" 
              strokeWidth={2}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar 
              dataKey={yAxis} 
              fill="var(--color-primary)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area 
              type="monotone" 
              dataKey={yAxis} 
              stroke="var(--color-primary)" 
              fill="var(--color-primary)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              type="category"
            />
            <YAxis 
              dataKey={yAxis}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              type="number"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Scatter 
              name={yAxis}
              dataKey={yAxis}
              fill="var(--color-primary)" 
            />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart() as React.ReactElement}
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default DynamicChart;
