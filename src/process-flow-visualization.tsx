import React, { useState } from 'react';

const ProcessFlowVisualization = () => {
  // Mock process flow data
  const [processData, setProcessData] = useState({
    steps: [
      {
        id: 'bulk-receipt',
        name: 'Bulk Receipt',
        avgDuration: 1.2,
        minDuration: 0.8,
        maxDuration: 2.5,
        status: 'normal',
        description: 'Receipt and registration of bulk materials'
      },
      {
        id: 'assembly',
        name: 'Assembly Process',
        avgDuration: 3.5,
        minDuration: 2.8,
        maxDuration: 5.2,
        status: 'normal',
        description: 'Manufacturing assembly operations'
      },
      {
        id: 'pci-review',
        name: 'PCI Review',
        avgDuration: 3.2,
        minDuration: 2.2,
        maxDuration: 6.8,
        status: 'bottleneck',
        description: 'Process review by PCI team'
      },
      {
        id: 'nn-review',
        name: 'NN Review',
        avgDuration: 3.0,
        minDuration: 2.0,
        maxDuration: 5.5,
        status: 'alert',
        description: 'Review by Novo Nordisk team'
      },
      {
        id: 'packaging',
        name: 'Packaging',
        avgDuration: 2.4,
        minDuration: 1.8,
        maxDuration: 4.2,
        status: 'normal',
        description: 'Primary and secondary packaging'
      },
      {
        id: 'pci-packaging-review',
        name: 'PCI Packaging Review',
        avgDuration: 2.1,
        minDuration: 1.5,
        maxDuration: 3.8,
        status: 'normal',
        description: 'Packaging review by PCI team'
      },
      {
        id: 'nn-packaging-review',
        name: 'NN Packaging Review',
        avgDuration: 1.8,
        minDuration: 1.2,
        maxDuration: 3.2,
        status: 'normal',
        description: 'Packaging review by Novo Nordisk team'
      },
      {
        id: 'release',
        name: 'Release',
        avgDuration: 1.0,
        minDuration: 0.5,
        maxDuration: 2.0,
        status: 'normal',
        description: 'Final lot release'
      }
    ],
    waitingPeriods: [
      {
        id: 'wait-assembly',
        fromStep: 'bulk-receipt',
        toStep: 'assembly',
        avgDuration: 0.5,
        impact: 'low'
      },
      {
        id: 'wait-pci-review',
        fromStep: 'assembly',
        toStep: 'pci-review',
        avgDuration: 1.2,
        impact: 'medium'
      },
      {
        id: 'wait-nn-review',
        fromStep: 'pci-review',
        toStep: 'nn-review',
        avgDuration: 0.8,
        impact: 'low'
      },
      {
        id: 'wait-packaging',
        fromStep: 'nn-review',
        toStep: 'packaging',
        avgDuration: 2.0,
        impact: 'high'
      },
      {
        id: 'wait-pci-packaging-review',
        fromStep: 'packaging',
        toStep: 'pci-packaging-review',
        avgDuration: 0.7,
        impact: 'low'
      },
      {
        id: 'wait-nn-packaging-review',
        fromStep: 'pci-packaging-review',
        toStep: 'nn-packaging-review',
        avgDuration: 0.6,
        impact: 'low'
      },
      {
        id: 'wait-release',
        fromStep: 'nn-packaging-review',
        toStep: 'release',
        avgDuration: 1.5,
        impact: 'medium'
      }
    ],
    totalCycleTime: {
      average: 21.8,
      target: 18.0,
      minimum: 16.2,
      maximum: 36.2
    },
    bottlenecks: [
      { step: 'wait-packaging', description: 'Long waiting time between NN review and packaging start' },
      { step: 'pci-review', description: 'Extended review durations in PCI process' }
    ],
    improvementInitiatives: [
      { 
        id: 'parallel-review',
        name: 'Parallel Review Process', 
        target: 'pci-review',
        status: 'In Progress',
        expectedImpact: '1.2 days reduction',
        completionDate: '2025-05-15'
      },
      { 
        id: 'schedule-optimization',
        name: 'Packaging Schedule Optimization', 
        target: 'wait-packaging',
        status: 'Planning',
        expectedImpact: '1.5 days reduction',
        completionDate: '2025-06-30'
      }
    ]
  });
  
  // Colors
  const colors = {
    primary: '#db0032', // Novo Nordisk Red
    secondary: '#0066a4', // Complementary Blue
    tertiary: '#00a0af', // Teal Accent
    success: '#00843d', // Green
    warning: '#ffc72c', // Amber
    danger: '#c8102e', // Alert Red
    darkText: '#212529',
    lightText: '#6c757d',
    stepColors: {
      normal: '#0066a4',
      bottleneck: '#c8102e',
      alert: '#ffc72c'
    },
    waitingImpactColors: {
      low: '#e9ecef',
      medium: '#ffeeba',
      high: '#f8d7da'
    }
  };
  
  // State for selected process step
  const [selectedStep, setSelectedStep] = useState(null);
  
  // Time unit filter
  const [timeUnit, setTimeUnit] = useState('days');
  
  // Function to get a process step by ID
  const getProcessStep = (stepId) => {
    return processData.steps.find(step => step.id === stepId);
  };
  
  // Process Flow Diagram
  const ProcessFlowDiagram = () => {
    const getStepColor = (status) => {
      return colors.stepColors[status] || colors.secondary;
    };
    
    const getWaitingColor = (impact) => {
      return colors.waitingImpactColors[impact] || colors.waitingImpactColors.low;
    };
    
    const handleStepClick = (step) => {
      setSelectedStep(step.id === selectedStep ? null : step.id);
    };
    
    // Calculate total width percentages for the diagram
    const totalProcessTime = processData.steps.reduce((acc, step) => acc + step.avgDuration, 0);
    const totalWaitingTime = processData.waitingPeriods.reduce((acc, period) => acc + period.avgDuration, 0);
    const totalTime = totalProcessTime + totalWaitingTime;
    
    // Calculate width percentage for each step and waiting period
    const getStepWidthPercentage = (duration) => {
      return (duration / totalTime) * 100;
    };
    
    return (
      <div className="mb-8">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">End-to-End Process Flow</h3>
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <span className="w-3 h-3 inline-block mr-1" style={{ backgroundColor: colors.stepColors.normal }}></span>
              <span className="text-xs text-gray-600">Normal</span>
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 inline-block mr-1" style={{ backgroundColor: colors.stepColors.bottleneck }}></span>
              <span className="text-xs text-gray-600">Bottleneck</span>
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 inline-block mr-1" style={{ backgroundColor: colors.stepColors.alert }}></span>
              <span className="text-xs text-gray-600">Alert</span>
            </span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="w-full flex">
            {processData.steps.map((step, index) => {
              // Get the waiting period before this step (if not the first step)
              const waitingPeriod = index > 0 
                ? processData.waitingPeriods.find(w => w.toStep === step.id) 
                : null;
              
              return (
                <React.Fragment key={step.id}>
                  {/* Waiting period */}
                  {waitingPeriod && (
                    <div 
                      className="h-20 flex items-center justify-center border-t border-b border-dashed px-1" 
                      style={{ 
                        width: `${getStepWidthPercentage(waitingPeriod.avgDuration)}%`,
                        backgroundColor: getWaitingColor(waitingPeriod.impact),
                        borderColor: 'rgba(0,0,0,0.2)'
                      }}
                    >
                      <div className="text-center">
                        <div className="text-xs font-medium mb-1 truncate max-w-full">Wait</div>
                        <div className="text-xs">{waitingPeriod.avgDuration} days</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Process step */}
                  <div 
                    className={`h-20 flex items-center justify-center border border-gray-300 px-2 cursor-pointer transition-all ${selectedStep === step.id ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ 
                      width: `${getStepWidthPercentage(step.avgDuration)}%`,
                      backgroundColor: getStepColor(step.status),
                      color: 'white'
                    }}
                    onClick={() => handleStepClick(step)}
                  >
                    <div className="text-center">
                      <div className="text-xs font-medium mb-1 truncate max-w-full">{step.name}</div>
                      <div className="text-xs">{step.avgDuration} days</div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          
          {/* Timeline markers */}
          <div className="w-full flex mt-2">
            {processData.steps.map((step, index) => {
              // Get the waiting period before this step (if not the first step)
              const waitingPeriod = index > 0 
                ? processData.waitingPeriods.find(w => w.toStep === step.id) 
                : null;
              
              // Calculate cumulative time up to this point
              const previousSteps = processData.steps.slice(0, index);
              const previousWaiting = processData.waitingPeriods.filter(w => 
                previousSteps.map(s => s.id).includes(w.fromStep)
              );
              
              const cumulativeTimeBefore = previousSteps.reduce((acc, s) => acc + s.avgDuration, 0) +
                                        previousWaiting.reduce((acc, w) => acc + w.avgDuration, 0);
              
              const cumulativeTimeAfter = cumulativeTimeBefore + 
                                        (waitingPeriod ? waitingPeriod.avgDuration : 0) + 
                                        step.avgDuration;
              
              return (
                <React.Fragment key={`timeline-${step.id}`}>
                  {/* Waiting period timeline */}
                  {waitingPeriod && (
                    <div style={{ width: `${getStepWidthPercentage(waitingPeriod.avgDuration)}%` }}>
                      {index === 1 && (
                        <div className="text-xs text-gray-500 text-center">
                          {cumulativeTimeBefore.toFixed(1)} d
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Process step timeline */}
                  <div style={{ width: `${getStepWidthPercentage(step.avgDuration)}%` }}>
                    {index === 0 && (
                      <div className="text-xs text-gray-500 text-left">
                        0 d
                      </div>
                    )}
                    {index === processData.steps.length - 1 && (
                      <div className="text-xs text-gray-500 text-right">
                        {cumulativeTimeAfter.toFixed(1)} d
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
        
        {/* Selected step details */}
        {selectedStep && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              {getProcessStep(selectedStep).name} Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-sm font-medium">{getProcessStep(selectedStep).description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Duration Range</p>
                <p className="text-sm font-medium">
                  Min: {getProcessStep(selectedStep).minDuration} days | 
                  Avg: {getProcessStep(selectedStep).avgDuration} days | 
                  Max: {getProcessStep(selectedStep).maxDuration} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-sm font-medium capitalize">{getProcessStep(selectedStep).status}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Cycle Time Breakdown Component
  const CycleTimeBreakdown = () => {
    // Calculate percentages for process vs waiting time
    const totalProcessTime = processData.steps.reduce((acc, step) => acc + step.avgDuration, 0);
    const totalWaitingTime = processData.waitingPeriods.reduce((acc, period) => acc + period.avgDuration, 0);
    const totalTime = totalProcessTime + totalWaitingTime;
    
    const processPercentage = (totalProcessTime / totalTime * 100).toFixed(1);
    const waitingPercentage = (totalWaitingTime / totalTime * 100).toFixed(1);
    
    // Bar chart data
    const processStepData = processData.steps.map(step => ({
      name: step.name,
      duration: step.avgDuration,
      color: colors.stepColors[step.status]
    }));
    
    const waitingPeriodData = processData.waitingPeriods.map(period => {
      const fromStep = getProcessStep(period.fromStep);
      const toStep = getProcessStep(period.toStep);
      
      return {
        name: `${fromStep.name} → ${toStep.name}`,
        duration: period.avgDuration,
        color: colors.waitingImpactColors[period.impact]
      };
    });
    
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Cycle Time Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-3">Overall Cycle Time Distribution</h4>
            
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Process Steps: {totalProcessTime.toFixed(1)} days ({processPercentage}%)</span>
                <span>Waiting Periods: {totalWaitingTime.toFixed(1)} days ({waitingPercentage}%)</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full" 
                  style={{ 
                    width: `${processPercentage}%`,
                    backgroundColor: colors.secondary,
                    float: 'left'
                  }}
                ></div>
                <div 
                  className="h-full" 
                  style={{ 
                    width: `${waitingPercentage}%`,
                    backgroundColor: colors.warning,
                    float: 'left'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div>
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 mr-2" style={{ backgroundColor: colors.secondary }}></div>
                  <span className="text-xs">Value-added Time</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-2" style={{ backgroundColor: colors.warning }}></div>
                  <span className="text-xs">Non-value-added Time</span>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-600 mb-1">Target Cycle Time</div>
                <div className="text-sm font-medium">{processData.totalCycleTime.target} days</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-600 mb-1">Current Cycle Time</div>
                <div 
                  className={`text-sm font-medium ${processData.totalCycleTime.average > processData.totalCycleTime.target ? 'text-red-600' : 'text-green-600'}`}
                >
                  {processData.totalCycleTime.average} days
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-3">Cycle Time Range</h4>
            
            <div className="relative pt-8 pb-4">
              {/* Axis */}
              <div className="absolute top-8 left-4 right-4 h-px bg-gray-300"></div>
              
              {/* Min, Avg, Max points */}
              <div 
                className="absolute top-8 w-4 h-4 rounded-full bg-green-500 transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(processData.totalCycleTime.minimum / 40) * 100}%` }}
              >
                <div className="absolute -top-6 left-0 transform -translate-x-1/2 text-xs whitespace-nowrap">
                  Min: {processData.totalCycleTime.minimum} days
                </div>
              </div>
              
              <div 
                className="absolute top-8 w-4 h-4 rounded-full bg-blue-500 transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(processData.totalCycleTime.average / 40) * 100}%` }}
              >
                <div className="absolute -top-6 left-0 transform -translate-x-1/2 text-xs whitespace-nowrap">
                  Avg: {processData.totalCycleTime.average} days
                </div>
              </div>
              
              <div 
                className="absolute top-8 w-4 h-4 rounded-full bg-red-500 transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(processData.totalCycleTime.maximum / 40) * 100}%` }}
              >
                <div className="absolute -top-6 left-0 transform -translate-x-1/2 text-xs whitespace-nowrap">
                  Max: {processData.totalCycleTime.maximum} days
                </div>
              </div>
              
              {/* Target line */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-yellow-500"
                style={{ left: `${(processData.totalCycleTime.target / 40) * 100}%` }}
              >
                <div className="absolute -top-6 left-0 transform -translate-x-1/2 text-xs whitespace-nowrap text-yellow-600">
                  Target: {processData.totalCycleTime.target} days
                </div>
                <div className="absolute bottom-0 left-0 transform -translate-x-1/2 text-xs whitespace-nowrap text-yellow-600">
                  Target
                </div>
              </div>
              
              {/* Range visualization */}
              <div 
                className="absolute top-8 h-px bg-gray-400"
                style={{ 
                  left: `${(processData.totalCycleTime.minimum / 40) * 100}%`, 
                  width: `${((processData.totalCycleTime.maximum - processData.totalCycleTime.minimum) / 40) * 100}%` 
                }}
              ></div>
              
              {/* Ticks */}
              {[0, 10, 20, 30, 40].map(tick => (
                <div 
                  key={tick} 
                  className="absolute top-8 h-2 w-px bg-gray-300"
                  style={{ left: `${(tick / 40) * 100}%` }}
                >
                  <div className="absolute bottom-4 left-0 transform -translate-x-1/2 text-xs">{tick}</div>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-gray-600 text-center mt-8">
              Cycle Time (days)
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-3">Process Step Duration</h4>
            <div className="space-y-3">
              {processStepData.map((step, index) => (
                <div key={`process-${index}`}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="truncate max-w-xs">{step.name}</span>
                    <span>{step.duration} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full" 
                      style={{ 
                        width: `${(step.duration / 6) * 100}%`,
                        maxWidth: '100%',
                        backgroundColor: step.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-3">Waiting Time Duration</h4>
            <div className="space-y-3">
              {waitingPeriodData.map((period, index) => (
                <div key={`waiting-${index}`}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="truncate max-w-xs">{period.name}</span>
                    <span>{period.duration} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full" 
                      style={{ 
                        width: `${(period.duration / 2) * 100}%`,
                        maxWidth: '100%',
                        backgroundColor: period.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Bottleneck Analysis Component
  const BottleneckAnalysis = () => {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Bottleneck Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-3">Identified Bottlenecks</h4>
            
            <div className="space-y-4">
              {processData.bottlenecks.map((bottleneck, index) => (
                <div key={`bottleneck-${index}`} className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="text-sm font-medium text-red-800 mb-1">{bottleneck.step.replace('wait-', 'Waiting: ')}</div>
                  <p className="text-sm text-red-700">{bottleneck.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-3">Improvement Initiatives</h4>
            
            <div className="space-y-4">
              {processData.improvementInitiatives.map((initiative, index) => (
                <div key={`initiative-${index}`} className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-green-800">{initiative.name}</div>
                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {initiative.status}
                    </div>
                  </div>
                  <p className="text-sm text-green-700 mt-1">Target: {initiative.target.replace('wait-', 'Waiting: ')}</p>
                  <div className="flex justify-between text-xs text-green-700 mt-1">
                    <span>Expected Impact: {initiative.expectedImpact}</span>
                    <span>Completion: {initiative.completionDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Summary Metrics Component
  const SummaryMetrics = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col">
            <div className="text-sm text-gray-500 mb-1">Total Cycle Time</div>
            <div className="flex items-end">
              <div className={`text-2xl font-bold ${processData.totalCycleTime.average > processData.totalCycleTime.target ? 'text-red-600' : 'text-green-600'}`}>
                {processData.totalCycleTime.average} days
              </div>
              <div className="text-xs ml-2 mb-1 text-gray-500">
                Target: {processData.totalCycleTime.target} days
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col">
            <div className="text-sm text-gray-500 mb-1">Value-Added Time</div>
            <div className="flex items-end">
              <div className="text-2xl font-bold text-blue-600">
                {processData.steps.reduce((acc, step) => acc + step.avgDuration, 0).toFixed(1)} days
              </div>
              <div className="text-xs ml-2 mb-1 text-gray-500">
                ({((processData.steps.reduce((acc, step) => acc + step.avgDuration, 0) / processData.totalCycleTime.average) * 100).toFixed(1)}% of total)
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col">
            <div className="text-sm text-gray-500 mb-1">Waiting Time</div>
            <div className="flex items-end">
              <div className="text-2xl font-bold text-yellow-600">
                {processData.waitingPeriods.reduce((acc, period) => acc + period.avgDuration, 0).toFixed(1)} days
              </div>
              <div className="text-xs ml-2 mb-1 text-gray-500">
                ({((processData.waitingPeriods.reduce((acc, period) => acc + period.avgDuration, 0) / processData.totalCycleTime.average) * 100).toFixed(1)}% of total)
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col">
            <div className="text-sm text-gray-500 mb-1">Identified Bottlenecks</div>
            <div className="flex items-end">
              <div className="text-2xl font-bold text-red-600">
                {processData.bottlenecks.length}
              </div>
              <div className="text-xs ml-2 mb-1 text-gray-500">
                {processData.improvementInitiatives.length} initiatives in progress
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Time Unit Controls
  const TimeUnitControls = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Time Unit</label>
            <select 
              className="border rounded-md px-3 py-1 text-sm"
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
            >
              <option value="days">Days</option>
              <option value="hours">Hours</option>
            </select>
          </div>
        </div>
        
        <div>
          <button className="px-3 py-1 bg-gray-100 rounded-md text-sm mr-2">
            Export Data
          </button>
          <button className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-sm">
            Optimization Recommendations
          </button>
        </div>
      </div>
    );
  };
  
  // Insights Panel
  const InsightsPanel = () => {
    return (
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Process Optimization Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Key Findings</h4>
            <ul className="text-sm text-blue-800 list-disc pl-5 space-y-1">
              <li>Waiting time between NN review and packaging represents 9.2% of total cycle time</li>
              <li>PCI review process consistently exceeds target durations by 25-30%</li>
              <li>Packaging scheduling inefficiencies add an average of 2 days to cycle time</li>
              <li>Cycle time variability has decreased 14% from previous quarter</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Recommended Optimizations</h4>
            <ul className="text-sm text-blue-800 list-disc pl-5 space-y-1">
              <li>Implement parallel review processes to reduce PCI review impact</li>
              <li>Restructure packaging queue management to reduce waiting time</li>
              <li>Standardize review documentation to reduce variation in review times</li>
              <li>Develop capacity model to balance workload distribution across process steps</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Process Flow Visualization</h2>
        <p className="text-sm text-gray-600">Interactive process flow diagram showing durations, bottlenecks, and improvement opportunities</p>
      </div>
      
      <TimeUnitControls />
      <SummaryMetrics />
      <InsightsPanel />
      
      <ProcessFlowDiagram />
      <CycleTimeBreakdown />
      <BottleneckAnalysis />
    </div>
  );
};

export default ProcessFlowVisualization;
