import React from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { FileText, AlertTriangle, Clock, CheckCircle, BarChart2, Activity, Settings, Search, ChevronRight } from 'lucide-react';

// Import our specialized components
import FormErrorAnalysis from './form-error-analysis.js';
import NNReviewTimeAnalysis from './nn-review-analysis.js';
import CustomerCommentAnalysis from './customer-comment-analysis-wrapper.js';
import ProcessFlowVisualization from './process-flow-visualization.js';
import InsightsDashboard from './insights-dashboard.js';
import LotAnalytics from './lot-analytics.js';

// Import data context provider from the separate context file
import { useDataContext } from './DataContext.js';

// Define missing components
const LoadingState = () => (
  <div className="bg-white rounded-lg shadow p-6 text-center">
    <div className="animate-spin mx-auto mb-4 w-8 h-8 border-2 border-dashed rounded-full border-blue-500"></div>
    <p className="text-gray-600">Loading dashboard data...</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="bg-white rounded-lg shadow p-6 text-center">
    <div className="mx-auto mb-4 w-12 h-12 text-red-500">
      <AlertTriangle size={48} />
    </div>
    <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
    <p className="text-gray-600">{message}</p>
  </div>
);

// Main dashboard component
const NovoNordiskDashboard = () => {
  // State for active tab
  const [activeTab, setActiveTab] = React.useState('overview');
  
  // Get data from context
  const { isLoading, error, data, fileStatus, lastUpdated, refreshData } = useDataContext();
  
  // Colors as per design spec
  const colors = {
    primary: '#db0032', // Novo Nordisk Red
    secondary: '#0066a4', // Complementary Blue
    tertiary: '#00a0af', // Teal Accent
    success: '#00843d', // Green
    warning: '#ffc72c', // Amber
    danger: '#c8102e', // Alert Red
    darkText: '#212529',
    lightText: '#6c757d',
    border: '#e9ecef',
    background: '#f8f9fa',
    chartColors: ['#00843d', '#c8102e', '#0066a4', '#ffc72c', '#00a0af'] // Success, Danger, Secondary, Warning, Tertiary
  };
  
  // RFT performance chart data
  const RFTPerformanceChart = () => {
    if (!data?.overview?.rftPerformance) {
      return (
        <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center">
          <p className="text-gray-500">No RFT performance data available</p>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64">
        <h3 className="text-lg font-semibold mb-4">RFT Performance</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart
            data={data.overview.rftPerformance}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}`, 'Count']} />
            <Legend />
            <Bar dataKey="value" name="Count">
              {data.overview.rftPerformance.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? colors.success : colors.danger} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Issue Distribution Chart
  const IssueDistributionChart = () => {
    if (!data?.overview?.issueDistribution || data.overview.issueDistribution.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center">
          <p className="text-gray-500">No issue distribution data available</p>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64">
        <h3 className="text-lg font-semibold mb-4">Issue Distribution Analysis</h3>
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie
              data={data.overview.issueDistribution}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.overview.issueDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors.chartColors[index % colors.chartColors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}`, 'Count']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Lot Quality Metrics
  const LotQualityMetrics = () => {
    if (!data?.overview?.lotQuality) {
      return (
        <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center">
          <p className="text-gray-500">No lot quality data available</p>
        </div>
      );
    }
    
    // Create data for donut chart
    const chartData = [
      { name: 'Pass', value: data.overview.lotQuality.pass },
      { name: 'Fail', value: data.overview.lotQuality.fail }
    ];
    
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64">
        <h3 className="text-lg font-semibold mb-4">Lot Quality Metrics</h3>
        <div className="flex items-center justify-center h-full relative">
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? colors.success : colors.danger} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{data.overview.lotQuality.percentage}%</span>
            <span className="text-sm text-green-600 flex items-center">
              <ChevronRight className="rotate-90" size={16} />
              {data.overview.lotQuality.change}% vs prior
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  // Process Timeline Chart
  const ProcessTimelineChart = () => {
    if (!data?.overview?.processTimeline) {
      return (
        <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center">
          <p className="text-gray-500">No process timeline data available</p>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64">
        <h3 className="text-lg font-semibold mb-4">Process Timeline</h3>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart
            data={data.overview.processTimeline}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[85, 95]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="recordRFT" 
              name="Record RFT %" 
              stroke={colors.primary} 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="lotRFT" 
              name="Lot RFT %" 
              stroke={colors.secondary} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // File Status Component that displays data source status
  const FileStatus = () => {
    const [fileStatuses, setFileStatuses] = React.useState({
      "Internal RFT.xlsx": { loaded: false, status: 'loading' },
      "External RFT.xlsx": { loaded: false, status: 'loading' },
      "Commercial Process.xlsx": { loaded: false, status: 'loading' }
    });
    const [processingStatus, setProcessingStatus] = React.useState('loading');
    const [lastRefreshed, setLastRefreshed] = React.useState(new Date());
    
    // Function to refresh data
    const handleRefreshData = () => {
      setProcessingStatus('loading');
      
      // Set all files to loading state
      setFileStatuses(prev => {
        const newStatuses = {};
        Object.keys(prev).forEach(key => {
          newStatuses[key] = { loaded: false, status: 'loading' };
        });
        return newStatuses;
      });
      
      // Call the refreshData function from context
      refreshData();
      
      // Simulate file loading sequence
      setTimeout(() => {
        setFileStatuses(prev => ({
          ...prev,
          "Internal RFT.xlsx": { loaded: true, status: 'success' }
        }));
        
        setTimeout(() => {
          setFileStatuses(prev => ({
            ...prev,
            "External RFT.xlsx": { loaded: true, status: 'success' }
          }));
          
          setTimeout(() => {
            setFileStatuses(prev => ({
              ...prev,
              "Commercial Process.xlsx": { loaded: true, status: 'success' }
            }));
            
            setProcessingStatus('success');
            setLastRefreshed(new Date());
          }, 800);
        }, 600);
      }, 1000);
    };
    
    // Auto-load files on component mount
    React.useEffect(() => {
      handleRefreshData();
    }, []);
    
    const getStatusIcon = (status) => {
      if (status === 'loading') {
        return (
          <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      } else if (status === 'success') {
        return <span className="text-green-600 text-xs">✓</span>;
      } else if (status === 'error') {
        return <span className="text-red-600 text-xs">✗</span>;
      }
      return null;
    };
    
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Data Sources</h3>
            <p className="text-sm text-gray-500">
              {processingStatus === 'loading' 
                ? 'Loading and processing data...' 
                : `Last refreshed: ${lastRefreshed.toLocaleTimeString()}`
              }
            </p>
          </div>
          <button 
            className={`px-4 py-2 ${processingStatus === 'loading' ? 'bg-blue-400' : 'bg-blue-500'} text-white rounded-md flex items-center`}
            onClick={handleRefreshData}
            disabled={processingStatus === 'loading'}
          >
            {processingStatus === 'loading' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </>
            )}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(fileStatuses).map(([filename, data]) => (
            <div key={filename} className={`px-3 py-1 ${data.status === 'error' ? 'bg-red-50' : 'bg-gray-100'} rounded-md text-sm flex items-center`}>
              <FileText size={14} className="mr-1" />
              {filename}
              <span className="ml-2">{getStatusIcon(data.status)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // KPI Cards Component
  const KPICards = () => {
    if (!data?.overview) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 h-24 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Records</p>
              <h2 className="text-2xl font-bold">{data.overview.totalRecords}</h2>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
              <FileText size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Lots</p>
              <h2 className="text-2xl font-bold">{data.overview.totalLots}</h2>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
              <BarChart2 size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall RFT Rate</p>
              <h2 className="text-2xl font-bold">{data.overview.overallRFTRate}%</h2>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Analysis Status</p>
              <h2 className="text-2xl font-bold">{data.overview.analysisStatus}</h2>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500">
              <Activity size={20} />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Main Dashboard Header
  const DashboardHeader = () => {
    // Get current date and time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return (
      <div 
        className="flex justify-between items-center p-4 mb-4 rounded-lg"
        style={{ 
          background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
          color: 'white'
        }}
      >
        <div className="flex items-center">
          <div className="mr-4 font-bold text-xl">Novo Nordisk</div>
          <h1 className="text-2xl font-bold">Pharmaceutical Manufacturing Dashboard</h1>
        </div>
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 px-3 py-1 rounded-md text-sm flex items-center">
            <Clock size={14} className="mr-1" />
            Last Updated: {formattedDate}, {formattedTime}
          </div>
        </div>
      </div>
    );
  };
  
  // Tab Navigation
  const TabNavigation = () => {
    const tabs = [
      { id: 'overview', name: 'Overview', icon: <BarChart2 size={16} /> },
      { id: 'internal', name: 'Internal RFT', icon: <AlertTriangle size={16} /> },
      { id: 'external', name: 'External RFT', icon: <AlertTriangle size={16} /> },
      { id: 'process', name: 'Process Metrics', icon: <Activity size={16} /> },
      { id: 'insights', name: 'Insights', icon: <Search size={16} /> },
      { id: 'lot', name: 'Lot Analytics', icon: <Settings size={16} /> }
    ];
    
    return (
      <div className="flex overflow-x-auto mb-6 border-b" style={{ borderColor: colors.border }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-3 flex items-center whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 text-red-600 font-medium' : 'text-gray-600'}`}
            style={{ borderColor: activeTab === tab.id ? colors.primary : 'transparent' }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div style={{ background: colors.background }} className="min-h-screen">
      <div className="container mx-auto p-4">
        <DashboardHeader />
        <FileStatus />
        <TabNavigation />
        
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="fade-in">
                <KPICards />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <RFTPerformanceChart />
                  <IssueDistributionChart />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LotQualityMetrics />
                  <ProcessTimelineChart />
                </div>
              </div>
            )}
            
            {activeTab === 'internal' && (
              <div className="fade-in">
                <FormErrorAnalysis />
              </div>
            )}
            
            {activeTab === 'external' && (
              <div className="fade-in">
                <CustomerCommentAnalysis />
              </div>
            )}
            
            {activeTab === 'process' && (
              <div className="fade-in">
                <div className="mb-6">
                  <NNReviewTimeAnalysis />
                </div>
                <div>
                  <ProcessFlowVisualization />
                </div>
              </div>
            )}
            
            {activeTab === 'insights' && (
              <div className="fade-in">
                <InsightsDashboard />
              </div>
            )}
            
            {activeTab === 'lot' && (
              <div className="fade-in">
                <LotAnalytics />
              </div>
            )}
            
            {(activeTab !== 'overview' && activeTab !== 'internal' && activeTab !== 'external' && activeTab !== 'process' && activeTab !== 'insights' && activeTab !== 'lot') && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Tab Under Development</h2>
                <p className="text-gray-500">The {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} dashboard tab is currently being implemented.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NovoNordiskDashboard; 