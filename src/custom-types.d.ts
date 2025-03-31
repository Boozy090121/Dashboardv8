// Type definitions for libraries that don't have proper TypeScript definitions

declare module 'recharts' {
  export const BarChart: React.ComponentType<any>;
  export const Bar: React.ComponentType<any>;
  export const PieChart: React.ComponentType<any>;
  export const Pie: React.ComponentType<any>;
  export const LineChart: React.ComponentType<any>;
  export const Line: React.ComponentType<any>;
  export const XAxis: React.ComponentType<any>;
  export const YAxis: React.ComponentType<any>;
  export const CartesianGrid: React.ComponentType<any>;
  export const Tooltip: React.ComponentType<any>;
  export const Legend: React.ComponentType<any>;
  export const ResponsiveContainer: React.ComponentType<any>;
  export const Cell: React.ComponentType<any>;
}

declare module 'lucide-react' {
  export const FileText: React.ComponentType<any>;
  export const AlertTriangle: React.ComponentType<any>;
  export const Clock: React.ComponentType<any>;
  export const CheckCircle: React.ComponentType<any>;
  export const BarChart2: React.ComponentType<any>;
  export const Activity: React.ComponentType<any>;
  export const Settings: React.ComponentType<any>;
  export const Search: React.ComponentType<any>;
  export const ChevronRight: React.ComponentType<any>;
} 