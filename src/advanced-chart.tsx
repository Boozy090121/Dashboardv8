import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Cell, Sector, ReferenceLine
} from 'recharts';
import { ChevronRight, X, ZoomIn, Download, Share, Info, RefreshCw } from 'lucide-react';

// Define TypeScript interface for the component props
interface AdvancedChartProps {
  title: string;
  description?: string;
  data: any[];
  type?: 'bar' | 'line' | 'area' | 'pie' | 'donut';
  xDataKey?: string;
  yDataKey?: string | string[];
  categories?: string[];
  colors?: string[];
  comparisonValue?: number;
  comparisonLabel?: string;
  showTotal?: boolean;
  currency?: boolean;
  percentage?: boolean;
  onDrillDown?: (data: any, index: number) => any;
  height?: number;
  allowDownload?: boolean;
  allowZoom?: boolean;
  noDataMessage?: string;
  isLoading?: boolean;
}

const AdvancedChart: React.FC<AdvancedChartProps> = ({
  title,
  description,
  data,
  type = 'bar',
  xDataKey,
  yDataKey,
  categories = [],
  colors,
  comparisonValue,
  comparisonLabel,
  showTotal = false,
  currency = false,
  percentage = false,
  onDrillDown = null,
  height = 400,
  allowDownload = true,
  allowZoom = true,
  noDataMessage = "No data available",
  isLoading = false
}) => {
  // State for interactions
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [drilldownVisible, setDrilldownVisible] = useState<boolean>(false);
  const [drilldownData, setDrilldownData] = useState<any[] | null>(null);
  const [drilldownTitle, setDrilldownTitle] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Refs
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Default chart colors
  const defaultColors = [
    '#db0032', // Novo Nordisk Red
    '#0066a4', // Complementary Blue
    '#00a0af', // Teal Accent
    '#00843d', // Green
    '#ffc72c', // Amber
    '#c8102e', // Alert Red
    '#6c757d', // Grey
    '#4e73df', // Indigo
    '#1cc88a', // Teal
    '#36b9cc', // Cyan
  ];
  
  // Determine colors to use
  const chartColors = colors || defaultColors;
  
  // Format values for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    
    if (percentage) {
      return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
    }
    
    if (currency) {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    return value.toLocaleString();
  };
  
  // Handle drill down on chart element click
  const handleClick = (data: any, index: number): void => {
    setActiveIndex(index);
    
    if (!onDrillDown) return;
    
    // Call the drill down handler
    const detail = onDrillDown(data, index);
    
    if (detail) {
      setDrilldownData(detail.data || []);
      setDrilldownTitle(detail.title || `Breakdown of ${data.name || 'selection'}`);
      setDrilldownVisible(true);
    }
  };
  
  // Close drill down view
  const closeDrillDown = (): void => {
    setDrilldownVisible(false);
    setDrilldownData(null);
    setActiveIndex(null);
  };
  
  // Toggle fullscreen view
  const toggleFullscreen = (): void => {
    if (!chartContainerRef.current) return;
    
    if (!isFullscreen) {
      if (chartContainerRef.current.requestFullscreen) {
        chartContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  // Export chart data as CSV
  const exportData = () => {
    if (!data || data.length === 0) return;
    
    // Create CSV content
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Calculate total for data if needed
  const calculateTotal = () => {
    if (!data || data.length === 0 || !yDataKey) return 0;
    
    if (typeof yDataKey === 'string') {
      return data.reduce((sum, item) => sum + (Number(item[yDataKey]) || 0), 0);
    }
    
    if (Array.isArray(yDataKey)) {
      // If multiple y data keys, sum them all
      return data.reduce((sum, item) => {
        let itemSum = 0;
        yDataKey.forEach(key => {
          itemSum += Number(item[key]) || 0;
        });
        return sum + itemSum;
      }, 0);
    }
    
    return 0;
  };
  
  // Custom active shape for pie charts
  const renderActiveShape = (props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value 
    } = props;
    
    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="text-sm font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={0} textAnchor="middle" fill="#333" className="text-lg font-bold">
          {formatValue(value)}
        </text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#999" className="text-xs">
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 12}
          fill={fill}
        />
      </g>
    );
  };
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: any, name: string) => {
    return [formatValue(value), name];
  };
  
  // Handle active dot click for line charts
  const handleActiveDotClick = (dotProps: any): void => {
    if (!data || !dotProps) return;
    
    // Find the index in the original data array
    const index = dotProps.index !== undefined ? dotProps.index : dotProps.dataIndex;
    
    if (index !== undefined && index >= 0 && index < data.length) {
      handleClick(data[index], index);
    }
  };
  
  // Render the appropriate chart type
  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{noDataMessage}</p>
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={24} className="animate-spin text-gray-400 mr-2" />
          <p className="text-gray-500">Loading data...</p>
        </div>
      );
    }
    
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      case 'pie':
        return renderPieChart();
      case 'donut':
        return renderDonutChart();
      default:
        return renderBarChart();
    }
  };
  
  // Render bar chart
  const renderBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          onClick={(e) => e && e.activeTooltipIndex !== undefined && handleClick(data[e.activeTooltipIndex], e.activeTooltipIndex)}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey={xDataKey} 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatValue(value)}
          />
          <Tooltip formatter={tooltipFormatter} />
          <Legend wrapperStyle={{ marginTop: 10 }} />
          
          {comparisonValue && (
            <ReferenceLine 
              y={comparisonValue} 
              stroke="#777" 
              strokeDasharray="3 3" 
              label={{ value: comparisonLabel || 'Reference', position: 'insideBottomRight', fill: '#777' }} 
            />
          )}
          
          {typeof yDataKey === 'string' ? (
            <Bar 
              dataKey={yDataKey} 
              fill={chartColors[0]}
              onClick={(data, index) => handleClick(data, index)}
              className="cursor-pointer hover:opacity-80"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={activeIndex === index ? chartColors[1] : chartColors[index % chartColors.length]} 
                />
              ))}
            </Bar>
          ) : (
            // Multiple bars if yDataKey is an array
            yDataKey.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                name={categories[index] || key}
                fill={chartColors[index % chartColors.length]}
                onClick={(data, index) => handleClick(data, index)}
                className="cursor-pointer hover:opacity-80"
              />
            ))
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render line chart
  const renderLineChart = () => {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          onClick={(e) => e && e.activeTooltipIndex !== undefined && handleClick(data[e.activeTooltipIndex], e.activeTooltipIndex)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xDataKey} 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatValue(value)}
          />
          <Tooltip formatter={tooltipFormatter} />
          <Legend wrapperStyle={{ marginTop: 10 }} />
          
          {comparisonValue && (
            <ReferenceLine 
              y={comparisonValue} 
              stroke="#777" 
              strokeDasharray="3 3" 
              label={{ value: comparisonLabel || 'Reference', position: 'insideBottomRight', fill: '#777' }} 
            />
          )}
          
          {typeof yDataKey === 'string' ? (
            <Line 
              type="monotone"
              dataKey={yDataKey} 
              stroke={chartColors[0]}
              activeDot={{ r: 8, onClick: handleActiveDotClick }}
              className="cursor-pointer"
              strokeWidth={2}
            />
          ) : (
            // Multiple lines if yDataKey is an array
            yDataKey.map((key, index) => (
              <Line 
                key={key}
                type="monotone"
                dataKey={key} 
                name={categories[index] || key}
                stroke={chartColors[index % chartColors.length]}
                activeDot={{ r: 8, onClick: handleActiveDotClick }}
                className="cursor-pointer"
                strokeWidth={2}
              />
            ))
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  // Render area chart
  const renderAreaChart = () => {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          onClick={(e) => e && e.activeTooltipIndex !== undefined && handleClick(data[e.activeTooltipIndex], e.activeTooltipIndex)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xDataKey} 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatValue(value)}
          />
          <Tooltip formatter={tooltipFormatter} />
          <Legend wrapperStyle={{ marginTop: 10 }} />
          
          {comparisonValue && (
            <ReferenceLine 
              y={comparisonValue} 
              stroke="#777" 
              strokeDasharray="3 3" 
              label={{ value: comparisonLabel || 'Reference', position: 'insideBottomRight', fill: '#777' }} 
            />
          )}
          
          {typeof yDataKey === 'string' ? (
            <Area 
              type="monotone"
              dataKey={yDataKey} 
              stroke={chartColors[0]}
              fill={`${chartColors[0]}80`} // 50% opacity
              activeDot={{ r: 8, onClick: handleActiveDotClick }}
              className="cursor-pointer"
            />
          ) : (
            // Multiple areas if yDataKey is an array
            yDataKey.map((key, index) => (
              <Area 
                key={key}
                type="monotone"
                dataKey={key} 
                name={categories[index] || key}
                stroke={chartColors[index % chartColors.length]}
                fill={`${chartColors[index % chartColors.length]}80`} // 50% opacity
                activeDot={{ r: 8, onClick: handleActiveDotClick }}
                className="cursor-pointer"
              />
            ))
          )}
        </AreaChart>
      </ResponsiveContainer>
    );
  };
  
  // Render pie chart
  const renderPieChart = () => {
    // If yDataKey is an array, use only the first element for pie charts
    const pieDataKey = Array.isArray(yDataKey) ? yDataKey[0] : yDataKey;
    
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={140}
            fill="#8884d8"
            dataKey={pieDataKey}
            nameKey={xDataKey}
            onMouseEnter={(data, index) => setActiveIndex(index)}
            onClick={(data, index) => handleClick(data, index)}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={chartColors[index % chartColors.length]} 
              />
            ))}
          </Pie>
          <Tooltip formatter={tooltipFormatter} />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  // Render donut chart
  const renderDonutChart = () => {
    // If yDataKey is an array, use only the first element for donut charts
    const donutDataKey = Array.isArray(yDataKey) ? yDataKey[0] : yDataKey;
    
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={140}
            fill="#8884d8"
            dataKey={donutDataKey}
            nameKey={xDataKey}
            onMouseEnter={(data, index) => setActiveIndex(index)}
            onClick={(data, index) => handleClick(data, index)}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={chartColors[index % chartColors.length]} 
              />
            ))}
          </Pie>
          <Tooltip formatter={tooltipFormatter} />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 transition-all duration-300 hover:shadow-md"
      ref={chartContainerRef}
    >
      {/* Chart header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            {title}
            {description && (
              <div className="relative group ml-2">
                <Info size={16} className="text-gray-400 cursor-help" />
                <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-md shadow-lg -left-2 top-6">
                  {description}
                </div>
              </div>
            )}
          </h3>
          
          {showTotal && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total: <span className="font-medium">{formatValue(calculateTotal())}</span>
            </div>
          )}
        </div>
        
        {/* Chart actions */}
        <div className="flex space-x-2">
          {allowDownload && (
            <button 
              onClick={exportData}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              title="Download data"
            >
              <Download size={16} />
            </button>
          )}
          
          {allowZoom && (
            <button 
              onClick={toggleFullscreen}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              title="Fullscreen"
            >
              <ZoomIn size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Main chart area */}
      {renderChart()}
      
      {/* Drill down content */}
      {drilldownVisible && drilldownData && (
        <div className="mt-8 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <ChevronRight size={18} className="mr-1" />
              {drilldownTitle}
            </h4>
            
            <button 
              onClick={closeDrillDown}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
              title="Close drilldown"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            {/* Render a nested chart or detailed data here */}
            {/* This is a placeholder implementation */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={drilldownData}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatValue(value)}
                />
                <Tooltip formatter={tooltipFormatter} />
                <Legend wrapperStyle={{ marginTop: 10 }} />
                <Bar 
                  dataKey="value" 
                  fill={chartColors[1]}
                >
                  {drilldownData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={chartColors[(index + 2) % chartColors.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedChart;
