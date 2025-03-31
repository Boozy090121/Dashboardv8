import React from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useDataContext } from './DataContext.js';

const ProcessFlowVisualization = () => {
  const { data, isLoading, error } = useDataContext();
  const [selectedStep, setSelectedStep] = React.useState(null);
  
  // Colors from design spec
  const colors = {
    primary: '#db0032', // Novo Nordisk Red
    secondary: '#0066a4', // Complementary Blue
    tertiary: '#00a0af', // Teal Accent
    success: '#00843d', // Green
    warning: '#ffc72c', // Amber
    danger: '#c8102e', // Alert Red
    neutral: '#6c757d', // Light Text
    chartColors: ['#00843d', '#c8102e', '#0066a4', '#ffc72c', '#00a0af'] // Success, Danger, Secondary, Warning, Tertiary
  };
  
  // Cycle Time Breakdown Chart
  const CycleTimeBreakdownChart = () => {
    if (!data?.processMetrics?.cycleTimeBreakdown || data.processMetrics.cycleTimeBreakdown.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No cycle time breakdown data available</div>;
    }
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.processMetrics.cycleTimeBreakdown}
            margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
            barSize={36}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis 
              dataKey="step" 
              type="category"
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [`${value} days`, 'Duration']}
              labelFormatter={(label) => `Step: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey="time" 
              name="Process Time (days)" 
              fill={colors.tertiary}
              onClick={(data) => setSelectedStep(data.step)}
            >
              {data.processMetrics.cycleTimeBreakdown.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={selectedStep === entry.step ? colors.primary : colors.tertiary} 
                  cursor="pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Waiting Time Analysis
  const WaitingTimeAnalysisChart = () => {
    if (!data?.processMetrics?.waitingTimes || data.processMetrics.waitingTimes.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No waiting time data available</div>;
    }
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.processMetrics.waitingTimes}
            margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
            barSize={30}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis 
              dataKey={(entry) => `${entry.from} → ${entry.to}`}
              type="category"
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [`${value} days`, 'Waiting Time']}
              labelFormatter={(label) => `Transition: ${label}`}
            />
            <Bar 
              dataKey="time" 
              name="Waiting Time (days)" 
              fill={colors.warning}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Review Time Comparison Chart
  const ReviewTimeComparisonChart = () => {
    if (!data?.processMetrics?.reviewTimes) {
      return <div className="p-4 bg-gray-50 rounded">No review time data available</div>;
    }
    
    // Convert to chart data format
    const chartData = [];
    const { NN, PCI } = data.processMetrics.reviewTimes;
    
    if (!NN || !PCI || NN.length === 0 || PCI.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">Incomplete review time data</div>;
    }
    
    // Create chart data from the arrays
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    for (let i = 0; i < Math.min(NN.length, PCI.length, months.length); i++) {
      chartData.push({
        month: months[i],
        NN: NN[i],
        PCI: PCI[i]
      });
    }
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[2, 4]} />
            <Tooltip formatter={(value) => [`${value.toFixed(1)} days`, '']} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="NN" 
              name="NN Review Time" 
              stroke={colors.primary} 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="PCI" 
              name="PCI Review Time" 
              stroke={colors.secondary} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Process Flow Diagram
  const ProcessFlowDiagram = () => {
    if (!data?.processMetrics?.cycleTimeBreakdown || data.processMetrics.cycleTimeBreakdown.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No process flow data available</div>;
    }
    
    // Define base flow steps from cycle time breakdown
    const steps = data.processMetrics.cycleTimeBreakdown.map(item => item.step);
    
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex flex-nowrap overflow-x-auto pb-4">
          {steps.map((step, index) => {
            const stepData = data.processMetrics.cycleTimeBreakdown.find(item => item.step === step);
            const waitingTime = index < steps.length - 1 
              ? data.processMetrics.waitingTimes?.find(item => item.from === step && item.to === steps[index + 1])?.time || 0 
              : 0;
              
            const isHighlighted = selectedStep === step;
            
            return (
              <div key={index} className="flex-shrink-0">
                {/* Step Box */}
                <div 
                  className={`w-40 h-24 ${isHighlighted ? 'bg-blue-100 border-blue-500' : 'bg-gray-100'} rounded-lg mx-2 p-3 flex flex-col justify-center items-center border-2 cursor-pointer transition-colors`}
                  onClick={() => setSelectedStep(step)}
                >
                  <div className="text-center font-medium">{step}</div>
                  <div className="text-sm text-gray-500 mt-2">{stepData?.time.toFixed(1)} days</div>
                </div>
                
                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="flex items-center justify-center mx-2 my-4">
                    <div className="h-0.5 bg-gray-300 w-12"></div>
                    <div className="text-xs text-gray-500 -mt-6 text-center w-full">
                      {waitingTime > 0 ? `${waitingTime.toFixed(1)} days` : ''}
                    </div>
                    <div className="h-0.5 bg-gray-300 w-12"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Step Details Panel
  const StepDetailsPanel = () => {
    if (!selectedStep || !data?.processMetrics?.cycleTimeBreakdown) {
      return null;
    }
    
    const stepData = data.processMetrics.cycleTimeBreakdown.find(item => item.step === selectedStep);
    if (!stepData) return null;
    
    // Define mock details for each step
    const stepDetails = {
      'Bulk Receipt': {
        owner: 'PCI Warehouse',
        description: 'Reception and sampling of bulk materials from suppliers',
        bottlenecks: ['Material verification', 'Sample testing'],
        recommendations: ['Implement barcode scanning system', 'Streamline sample testing workflow']
      },
      'Assembly': {
        owner: 'PCI Production',
        description: 'Assembly of product components and packaging',
        bottlenecks: ['Machine setup time', 'Component availability'],
        recommendations: ['Implement SMED techniques', 'Improve component inventory management']
      },
      'PCI Review': {
        owner: 'PCI Quality Assurance',
        description: 'Internal quality checks and documentation review',
        bottlenecks: ['Documentation completeness', 'Review queue management'],
        recommendations: ['Standardize documentation templates', 'Implement priority-based queue system']
      },
      'NN Review': {
        owner: 'Novo Nordisk QA',
        description: 'Client review of batch documentation and quality records',
        bottlenecks: ['Communication delays', 'Review checklist complexity'],
        recommendations: ['Implement shared review platform', 'Simplify review checklist']
      },
      'Packaging': {
        owner: 'PCI Packaging',
        description: 'Final packaging and preparation for shipment',
        bottlenecks: ['Packaging material availability', 'Line changeover'],
        recommendations: ['Optimize packaging material ordering', 'Implement visual management system']
      },
      'Final Review': {
        owner: 'Joint PCI-NN Team',
        description: 'Final quality verification and approval',
        bottlenecks: ['Signature collection', 'Issue resolution'],
        recommendations: ['Implement electronic approval system', 'Establish rapid-response issue resolution team']
      },
      'Release': {
        owner: 'NN Supply Chain',
        description: 'Final approval and release to distribution',
        bottlenecks: ['System update delays', 'Documentation completeness'],
        recommendations: ['Automate system updates', 'Implement pre-release documentation checklist']
      }
    };
    
    const details = stepDetails[selectedStep] || {
      owner: 'Not specified',
      description: 'No description available',
      bottlenecks: [],
      recommendations: []
    };
    
    return (
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
        <h3 className="text-lg font-semibold mb-2">{selectedStep} Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Owner:</span> {details.owner}</p>
            <p className="text-sm text-gray-600 mb-3"><span className="font-medium">Duration:</span> {stepData.time.toFixed(1)} days</p>
            <p className="text-sm text-gray-600 mb-3"><span className="font-medium">Description:</span> {details.description}</p>
            
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-600">Key Bottlenecks:</span>
              <ul className="list-disc text-sm text-gray-600 pl-5 mt-1">
                {details.bottlenecks.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-600">Improvement Recommendations:</span>
              <ul className="list-disc text-sm text-gray-600 pl-5 mt-1">
                {details.recommendations.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-3 bg-white rounded-lg shadow">
              <h4 className="text-sm font-medium mb-2">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Target Time:</span>
                  <span className="font-medium ml-2">{(stepData.time * 0.8).toFixed(1)} days</span>
                </div>
                <div>
                  <span className="text-gray-500">Variance:</span>
                  <span className="font-medium ml-2">±{(stepData.time * 0.2).toFixed(1)} days</span>
                </div>
                <div>
                  <span className="text-gray-500">Error Rate:</span>
                  <span className="font-medium ml-2">{(Math.random() * 10).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Improvement:</span>
                  <span className="text-green-500 font-medium ml-2">↓ 12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Process Summary
  const ProcessSummary = () => {
    if (!data?.processMetrics?.cycleTimeBreakdown || data.processMetrics.cycleTimeBreakdown.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No process data available</div>;
    }
    
    // Calculate total process time
    const totalProcessTime = data.processMetrics.cycleTimeBreakdown.reduce((sum, item) => sum + item.time, 0);
    
    // Calculate total waiting time
    const totalWaitingTime = data.processMetrics.waitingTimes 
      ? data.processMetrics.waitingTimes.reduce((sum, item) => sum + item.time, 0) 
      : 0;
    
    // Calculate total cycle time
    const totalCycleTime = totalProcessTime + totalWaitingTime;
    
    // Calculate process efficiency (value-added time / total time)
    const processEfficiency = (totalProcessTime / totalCycleTime * 100).toFixed(1);
    
    // Get the longest step
    const longestStep = data.processMetrics.cycleTimeBreakdown.sort((a, b) => b.time - a.time)[0];
    
    // Get the longest waiting period
    const longestWait = data.processMetrics.waitingTimes 
      ? data.processMetrics.waitingTimes.sort((a, b) => b.time - a.time)[0]
      : null;
    
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Process Summary</h3>
          <p className="text-sm text-gray-600 mb-1">Total Cycle Time: <span className="font-semibold">{totalCycleTime.toFixed(1)} days</span></p>
          <p className="text-sm text-gray-600 mb-1">Process Time: <span className="font-semibold">{totalProcessTime.toFixed(1)} days</span></p>
          <p className="text-sm text-gray-600 mb-1">Waiting Time: <span className="font-semibold">{totalWaitingTime.toFixed(1)} days</span></p>
          <p className="text-sm text-gray-600">Process Efficiency: <span className="font-semibold">{processEfficiency}%</span></p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Bottleneck Analysis</h3>
          <p className="text-sm text-gray-600 mb-1">
            Longest Process Step: <span className="font-semibold">{longestStep.step} ({longestStep.time.toFixed(1)} days)</span>
          </p>
          {longestWait && (
            <p className="text-sm text-gray-600 mb-1">
              Longest Wait Time: <span className="font-semibold">{longestWait.from} → {longestWait.to} ({longestWait.time.toFixed(1)} days)</span>
            </p>
          )}
          <p className="text-sm text-gray-600 mb-1">
            Target Cycle Time: <span className="font-semibold">{(totalCycleTime * 0.8).toFixed(1)} days</span>
          </p>
          <p className="text-sm text-gray-600">
            Improvement Opportunity: <span className="font-semibold">{(totalCycleTime * 0.2).toFixed(1)} days</span>
          </p>
        </div>
      </div>
    );
  };
  
  // Filter controls
  const FilterControls = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Time Period</label>
            <select className="border rounded-md px-3 py-1 text-sm">
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Process Step</label>
            <select 
              className="border rounded-md px-3 py-1 text-sm"
              value={selectedStep || ''}
              onChange={(e) => setSelectedStep(e.target.value || null)}
            >
              <option value="">All Steps</option>
              {data?.processMetrics?.cycleTimeBreakdown?.map((item, index) => (
                <option key={index} value={item.step}>{item.step}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <button className="px-3 py-1 bg-gray-100 rounded-md text-sm mr-2">
            Export Data
          </button>
          <button className="px-3 py-1 bg-gray-100 rounded-md text-sm">
            View Details
          </button>
        </div>
      </div>
    );
  };
  
  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center py-8">
        <div className="animate-spin mx-auto mb-4 w-8 h-8 border-2 border-dashed rounded-full border-blue-500"></div>
        <p className="text-gray-600">Loading process flow visualization...</p>
      </div>
    );
  }
  
  if (error || !data.processMetrics) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center py-8">
        <div className="mx-auto mb-4 w-12 h-12 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-600 mb-2">No Process Metrics Data</h3>
        <p className="text-gray-600">{error || "There is no process metrics data available in the dataset"}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Process Flow Visualization</h2>
        <p className="text-gray-500 text-sm">Analysis of manufacturing process flow and bottlenecks</p>
      </div>
      
      <FilterControls />
      
      <ProcessSummary />
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Process Flow Diagram</h3>
        <p className="text-sm text-gray-600 mb-2">Click on a process step to view details</p>
        <ProcessFlowDiagram />
        {selectedStep && <StepDetailsPanel />}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Process Time by Step</h3>
          <CycleTimeBreakdownChart />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Waiting Time Between Steps</h3>
          <WaitingTimeAnalysisChart />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Review Time Comparison: NN vs PCI</h3>
        <ReviewTimeComparisonChart />
      </div>
    </div>
  );
};

export default ProcessFlowVisualization; 