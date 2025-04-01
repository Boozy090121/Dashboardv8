import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDataContext } from './DataContext.js';
import DashboardGrid from './dashboard-grid';
import MetricCard from './metric-card';
import AdvancedChart from './advanced-chart';
import { Settings, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const EnhancedOverviewDashboard = () => {
  const { data, isLoading, error, refreshData } = useDataContext();
  
  // Additional state for enhanced widgets
  const [rftDrilldownData, setRftDrilldownData] = useState(null);
  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 12m, ytd
  
  // Track whether charts have been initialized
  const [chartsReady, setChartsReady] = useState(false);
  
  // Once data is loaded, prepare charts
  useEffect(() => {
    if (data && !isLoading) {
      setChartsReady(true);
    }
  }, [data, isLoading]);
  
  // Wrap handleRefresh in useCallback
  const handleRefresh = useCallback((widgetId) => {
    console.log(`Refreshing widget: ${widgetId}`);
    refreshData();
  }, [refreshData]); // Dependency: refreshData
  
  // Generate RFT breakdown data for drill-down with useMemo
  const handleRftDrillDown = useCallback((clickedData, index) => {
    // Generate breakdown data based on clicked slice
    if (clickedData?.name === 'Pass') {
      return {
        title: 'Success Breakdown by Department',
        data: [
          { name: 'Production', value: data?.internalRFT?.departmentPerformance?.[0]?.pass || 328 },
          { name: 'Quality', value: data?.internalRFT?.departmentPerformance?.[1]?.pass || 248 },
          { name: 'Packaging', value: data?.internalRFT?.departmentPerformance?.[2]?.pass || 187 },
          { name: 'Logistics', value: data?.internalRFT?.departmentPerformance?.[3]?.pass || 156 }
        ]
      };
    } else {
      return {
        title: 'Error Breakdown by Type',
        data: data?.overview?.issueDistribution || [
          { name: 'Documentation Error', value: 42 },
          { name: 'Process Deviation', value: 28 },
          { name: 'Equipment Issue', value: 15 },
          { name: 'Material Issue', value: 11 }
        ]
      };
    }
  }, [data]); // Add data as dependency
  
  // Generate trend data for cycle time with useMemo
  const cycleTimeTrendData = useMemo(() => {
    if (data?.processMetrics?.cycleTimesByMonth) {
      return data.processMetrics.cycleTimesByMonth.map(item => ({
        month: item.month,
        value: item.averageCycleTime
      }));
    }
    
    // Default mock data
    return [
      { month: '2025-01', value: 21.2 },
      { month: '2025-02', value: 22.5 },
      { month: '2025-03', value: 20.8 },
      { month: '2025-04', value: 21.5 },
      { month: '2025-05', value: 19.8 },
      { month: '2025-06', value: 18.5 }
    ];
  }, [data]); // Add data as dependency
  
  // Generate dept performance data with useMemo
  const deptPerformanceData = useMemo(() => {
    if (data?.internalRFT?.departmentPerformance) {
      return data.internalRFT.departmentPerformance.map(dept => ({
        name: dept.department,
        rftRate: dept.rftRate,
        target: 95
      }));
    }
    
    // Default mock data
    return [
      { name: 'Production', rftRate: 93.7, target: 95 },
      { name: 'Quality', rftRate: 95.4, target: 95 },
      { name: 'Packaging', rftRate: 91.2, target: 95 },
      { name: 'Logistics', rftRate: 86.7, target: 95 }
    ];
  }, [data]); // Add data as dependency
  
  // Loading state
  if (isLoading && !chartsReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-novo-red rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !chartsReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <AlertTriangle size={64} />
          </div>
          <p className="text-gray-700 font-medium">Error Loading Data</p>
          <p className="text-gray-500 mt-1">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-novo-red text-white rounded-md hover:bg-red-700"
            onClick={refreshData}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Time range selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Manufacturing Overview</h2>
        
        <div className="flex space-x-1">
          {['1m', '3m', '6m', '12m', 'ytd'].map((range) => (
            <button
              key={range}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === range
                  ? 'bg-novo-red text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setTimeRange(range)}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Records"
          value={data?.overview?.totalRecords || 1245}
          previousValue={data?.overview?.totalRecords ? data.overview.totalRecords - 25 : 1220}
          trend="up"
          trendData={[
            { value: 1190 },
            { value: 1205 },
            { value: 1215 },
            { value: 1220 },
            { value: 1235 },
            { value: data?.overview?.totalRecords || 1245 }
          ]}
          showDetails={true}
          detailMetrics={[
            { label: 'Production', value: 458 },
            { label: 'Quality', value: 326 },
            { label: 'Packaging', value: 278 },
            { label: 'Logistics', value: 183 }
          ]}
        />
        
        <MetricCard
          title="Total Lots"
          value={data?.overview?.totalLots || 78}
          previousValue={data?.overview?.totalLots ? data.overview.totalLots - 2 : 76}
          trend="up"
          status={data?.overview?.totalLots > 80 ? 'warning' : 'normal'}
          trendData={[
            { value: 71 },
            { value: 73 },
            { value: 74 },
            { value: 76 },
            { value: 77 },
            { value: data?.overview?.totalLots || 78 }
          ]}
          showDetails={true}
          detailMetrics={[
            { label: 'Released', value: 65 },
            { label: 'In Process', value: 13 }
          ]}
        />
        
        <MetricCard
          title="Overall RFT Rate"
          value={data?.overview?.overallRFTRate || 92.3}
          previousValue={data?.overview?.overallRFTRate ? data.overview.overallRFTRate - 1.5 : 90.8}
          trend="up"
          percentage={true}
          status={
            (data?.overview?.overallRFTRate || 92.3) >= 95 ? 'success' : 
            (data?.overview?.overallRFTRate || 92.3) >= 90 ? 'normal' :
            (data?.overview?.overallRFTRate || 92.3) >= 85 ? 'warning' : 'critical'
          }
          goal={95}
          goalLabel="Target RFT"
          trendData={[
            { value: 88.5 },
            { value: 89.2 },
            { value: 90.1 },
            { value: 90.8 },
            { value: 91.5 },
            { value: data?.overview?.overallRFTRate || 92.3 }
          ]}
          showDetails={true}
          detailMetrics={[
            { label: 'Record Level', value: data?.overview?.overallRFTRate || 92.3 },
            { label: 'Lot Level', value: data?.overview?.lotQuality?.percentage || 92.3 }
          ]}
        />
        
        <MetricCard
          title="Avg. Cycle Time"
          value={data?.processMetrics?.totalCycleTime?.average || 21.8}
          previousValue={data?.processMetrics?.totalCycleTime?.average ? data.processMetrics.totalCycleTime.average + 2.3 : 24.1}
          trend="down"
          goal={data?.processMetrics?.totalCycleTime?.target || 18.0}
          goalLabel="Target Time"
          status={
            (data?.processMetrics?.totalCycleTime?.average || 21.8) <= 18 ? 'success' : 
            (data?.processMetrics?.totalCycleTime?.average || 21.8) <= 22 ? 'normal' :
            (data?.processMetrics?.totalCycleTime?.average || 21.8) <= 25 ? 'warning' : 'critical'
          }
          trendData={cycleTimeTrendData}
          showDetails={true}
          detailMetrics={[
            { label: 'Min Observed', value: data?.processMetrics?.totalCycleTime?.minimum || 16.2 },
            { label: 'Max Observed', value: data?.processMetrics?.totalCycleTime?.maximum || 36.2 }
          ]}
        />
      </div>
      
      {/* Charts grid */}
      <DashboardGrid>
        <DashboardGrid.Widget
          title="RFT Performance"
          size="medium"
          onRefresh={handleRefresh}
        >
          <AdvancedChart
            title="Pass vs. Fail Distribution"
            data={data?.overview?.rftPerformance || [
              { name: 'Pass', value: 1149, percentage: 92.3 },
              { name: 'Fail', value: 96, percentage: 7.7 }
            ]}
            type="pie"
            xDataKey="name"
            yDataKey="value"
            onDrillDown={handleRftDrillDown}
            height={300}
          />
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Issue Distribution"
          size="medium"
          onRefresh={handleRefresh}
        >
          <AdvancedChart
            title="Top Issues by Count"
            data={data?.overview?.issueDistribution || [
              { name: 'Documentation Error', value: 42 },
              { name: 'Process Deviation', value: 28 },
              { name: 'Equipment Issue', value: 15 },
              { name: 'Material Issue', value: 11 }
            ]}
            type="bar"
            xDataKey="name"
            yDataKey="value"
            height={300}
            allowDownload={true}
          />
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Department Performance"
          size="medium"
          onRefresh={handleRefresh}
        >
          <AdvancedChart
            title="RFT Rate by Department"
            data={deptPerformanceData}
            type="bar"
            xDataKey="name"
            yDataKey="rftRate"
            percentage={true}
            comparisonValue={95}
            comparisonLabel="Target RFT"
            height={300}
          />
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Lot Quality"
          size="medium"
          onRefresh={handleRefresh}
        >
          <AdvancedChart
            title="Lot Level RFT"
            data={[
              { name: 'Pass', value: data?.overview?.lotQuality?.pass || 72 },
              { name: 'Fail', value: data?.overview?.lotQuality?.fail || 6 }
            ]}
            type="donut"
            xDataKey="name"
            yDataKey="value"
            height={300}
          />
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Process Timeline"
          size="large"
          onRefresh={handleRefresh}
        >
          <AdvancedChart
            title="Monthly RFT Performance"
            data={data?.overview?.processTimeline || [
              { month: 'Jan', recordRFT: 90.2, lotRFT: 91.5 },
              { month: 'Feb', recordRFT: 91.4, lotRFT: 92.0 },
              { month: 'Mar', recordRFT: 92.8, lotRFT: 93.1 },
              { month: 'Apr', recordRFT: 91.5, lotRFT: 92.3 },
              { month: 'May', recordRFT: 92.3, lotRFT: 93.5 },
              { month: 'Jun', recordRFT: 93.1, lotRFT: 94.0 }
            ]}
            type="line"
            xDataKey="month"
            yDataKey={['recordRFT', 'lotRFT']}
            categories={['Record RFT %', 'Lot RFT %']}
            percentage={true}
            comparisonValue={95}
            comparisonLabel="Target RFT"
            height={300}
          />
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Cycle Time Breakdown"
          size="large"
          onRefresh={handleRefresh}
        >
          <AdvancedChart
            title="Process Step Duration"
            data={data?.processMetrics?.cycleTimeBreakdown || [
              { step: 'Bulk Receipt', time: 1.2 },
              { step: 'Assembly', time: 3.5 },
              { step: 'PCI Review', time: 3.2 },
              { step: 'NN Review', time: 3.0 },
              { step: 'Packaging', time: 2.4 },
              { step: 'Final Review', time: 1.8 },
              { step: 'Release', time: 1.0 }
            ]}
            type="bar"
            xDataKey="step"
            yDataKey="time"
            description="Average duration in days for each process step"
            height={300}
          />
        </DashboardGrid.Widget>
      </DashboardGrid>
      
      {/* Key insights section */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Key Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Positive Trends</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="mt-0.5 mr-2 text-green-500">
                  <TrendingUp size={18} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Overall RFT rate has improved by {((data?.overview?.overallRFTRate || 92.3) - 90.8).toFixed(1)}% compared to previous period,
                  indicating process improvements are effective.
                </p>
              </li>
              <li className="flex items-start">
                <div className="mt-0.5 mr-2 text-green-500">
                  <TrendingUp size={18} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Average cycle time has decreased by {(24.1 - (data?.processMetrics?.totalCycleTime?.average || 21.8)).toFixed(1)} days (9.5%),
                  bringing us closer to the target of {data?.processMetrics?.totalCycleTime?.target || 18.0} days.
                </p>
              </li>
              <li className="flex items-start">
                <div className="mt-0.5 mr-2 text-green-500">
                  <TrendingUp size={18} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Quality department is exceeding RFT targets with a {deptPerformanceData[1].rftRate}% performance rate,
                  providing an opportunity to identify best practices.
                </p>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Areas for Improvement</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="mt-0.5 mr-2 text-red-500">
                  <TrendingDown size={18} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Documentation errors remain the primary driver of quality issues ({(data?.overview?.issueDistribution?.[0]?.value || 42)} occurrences),
                  suggesting a need for additional training or process revisions.
                </p>
              </li>
              <li className="flex items-start">
                <div className="mt-0.5 mr-2 text-red-500">
                  <TrendingDown size={18} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Logistics department RFT rate ({deptPerformanceData[3].rftRate}%) is significantly below target.
                  Consider targeted process improvements in this area.
                </p>
              </li>
              <li className="flex items-start">
                <div className="mt-0.5 mr-2 text-red-500">
                  <TrendingDown size={18} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Waiting time between process steps represents {((data?.processMetrics?.totalCycleTime?.average || 21.8) - (data?.processMetrics?.totalCycleTime?.average || 21.8) * 0.7).toFixed(1)} days (30%)
                  of total cycle time, presenting an optimization opportunity.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOverviewDashboard;
