declare module './ExcelProcessor' {
  export default class NovoNordiskExcelProcessor {
    constructor();
    processExcelFile(fileData: any, fileType: string): void;
    getProcessedData(): any;
  }
}

// Add any other module declarations as needed 

// Global type definitions for the project

// Fix React type issues
declare namespace React {
  export import createElement = globalThis.React.createElement;
  export import Children = globalThis.React.Children;
  export import cloneElement = globalThis.React.cloneElement;
  export import Fragment = globalThis.React.Fragment;
  export import Component = globalThis.React.Component;
  export import useState = globalThis.React.useState;
  export import useEffect = globalThis.React.useEffect;
  export import useRef = globalThis.React.useRef;
  export import createContext = globalThis.React.createContext;
  export import useContext = globalThis.React.useContext;
  export type FC<P = {}> = globalThis.React.FC<P>;
  export type ReactNode = globalThis.React.ReactNode;
}

// Define missing Recharts components
declare module 'recharts' {
  import * as React from 'react';

  // Existing components
  export const BarChart: React.FC<any>;
  export const Bar: React.FC<any>;
  export const LineChart: React.FC<any>;
  export const Line: React.FC<any>;
  export const PieChart: React.FC<any>;
  export const Pie: React.FC<any>;
  export const XAxis: React.FC<any>;
  export const YAxis: React.FC<any>;
  export const CartesianGrid: React.FC<any>;
  export const Tooltip: React.FC<any>;
  export const Legend: React.FC<any>;
  export const ResponsiveContainer: React.FC<any>;
  export const Cell: React.FC<any>;
  
  // Missing components
  export const AreaChart: React.FC<any>;
  export const Area: React.FC<any>;
  export const Sector: React.FC<any>;
  export const ReferenceLine: React.FC<any>;
  export const ScatterChart: React.FC<any>;
  export const Scatter: React.FC<any>;
}

// Define missing Lucide React components
declare module 'lucide-react' {
  import * as React from 'react';
  
  // Existing components
  export const FileText: React.FC<any>;
  export const AlertTriangle: React.FC<any>;
  export const Clock: React.FC<any>;
  export const CheckCircle: React.FC<any>;
  export const BarChart2: React.FC<any>;
  export const Activity: React.FC<any>;
  export const Settings: React.FC<any>;
  export const Search: React.FC<any>;
  export const ChevronRight: React.FC<any>;
  
  // Missing components
  export const X: React.FC<any>;
  export const ZoomIn: React.FC<any>;
  export const Download: React.FC<any>;
  export const Share: React.FC<any>;
  export const Info: React.FC<any>;
  export const RefreshCw: React.FC<any>;
  export const PieChartIcon: React.FC<any>;
  export const TrendingUp: React.FC<any>;
  export const TrendingDown: React.FC<any>;
  export const ChevronDown: React.FC<any>;
  export const ChevronUp: React.FC<any>;
  export const Maximize: React.FC<any>;
  export const Minimize: React.FC<any>;
  export const MoreHorizontal: React.FC<any>;
  export const Filter: React.FC<any>;
  export const ArrowLeft: React.FC<any>;
  export const ArrowRight: React.FC<any>;
  export const Refresh: React.FC<any>;
}

// Fix colSpan type issues
declare namespace JSX {
  interface HTMLAttributes {
    colSpan?: number | string;
  }
}

// Define lot data structure to fix "unknown" type issues
interface LotData {
  hasErrors?: boolean;
  recordCount?: number;
  errorCount?: number;
  released?: boolean;
  department?: string;
  packagingStart?: string;
  packagingFinish?: string;
  rftRate?: number;
  cycleTime?: number;
  releaseDate?: string;
  [key: string]: any;
}

// Define comment data structure
interface CommentData {
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
    [key: string]: number;
  };
  resolutionRates: Array<{
    resolved: number;
    [key: string]: any;
  }>;
  repeatedVsNew: {
    repeated: number;
    new: number;
    [key: string]: number;
  };
} 