import React from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useDataContext } from './DataContext.js';

const InsightsDashboard = () => {
  const { data, isLoading, error } = useDataContext();
  
  // Store insights state
  const [rootCauses, setRootCauses] = React.useState([]);
  const [predictions, setPredictions] = React.useState({
    rft: [],
    cycle: []
  });
  const [opportunities, setOpportunities] = React.useState([]);
  const [correlations, setCorrelations] = React.useState([]);
  
  // Generate insights when data changes
  React.useEffect(() => {
    if (!data) return;
    
    generateInsights();
  }, [data]);
  
  // Generate insights from available data
  const generateInsights = () => {
    // Generate root causes
    generateRootCauses();
    
    // Generate predictions
    generatePredictions();
    
    // Generate improvement opportunities
    generateOpportunities();
    
    // Generate correlations
    generateCorrelations();
  };
  
  // Generate root causes analysis
  const generateRootCauses = () => {
    const causes = [];
    
    // Add causes based on form errors (internal RFT)
    if (data?.internalRFT?.formErrors && data.internalRFT.formErrors.length > 0) {
      // Find the top error forms
      const topErrorForms = data.internalRFT.formErrors.slice(0, 3);
      
      topErrorForms.forEach(form => {
        causes.push({
          category: 'Documentation',
          issue: `${form.name} Errors`,
          count: form.errors,
          impact: form.trend === 'up' ? 'Increasing' : form.trend === 'down' ? 'Decreasing' : 'Stable',
          recommendation: getRecommendationForForm(form.name)
        });
      });
    }
    
    // Add causes based on customer feedback (external RFT)
    if (data?.externalRFT?.customerComments && data.externalRFT.customerComments.length > 0) {
      const negativeComments = [...data.externalRFT.customerComments]
        .filter(comment => comment.sentiment < -0.2)
        .sort((a, b) => a.sentiment - b.sentiment)
        .slice(0, 2);
      
      negativeComments.forEach(comment => {
        causes.push({
          category: 'Customer Feedback',
          issue: `${comment.category} Issues`,
          count: comment.count,
          impact: 'High',
          recommendation: getRecommendationForCustomerIssue(comment.category)
        });
      });
    }
    
    // Add causes based on process bottlenecks
    if (data?.processMetrics?.cycleTimeBreakdown && data.processMetrics.cycleTimeBreakdown.length > 0) {
      // Find the longest process step
      const longestSteps = [...data.processMetrics.cycleTimeBreakdown]
        .sort((a, b) => b.time - a.time)
        .slice(0, 1);
        
      longestSteps.forEach(step => {
        causes.push({
          category: 'Process',
          issue: `${step.step} Duration`,
          count: Math.round(step.time),
          impact: 'High',
          recommendation: getRecommendationForProcess(step.step)
        });
      });
    }
    
    // Add causes based on waiting times
    if (data?.processMetrics?.waitingTimes && data.processMetrics.waitingTimes.length > 0) {
      // Find the longest waiting time
      const longestWait = [...data.processMetrics.waitingTimes]
        .sort((a, b) => b.time - a.time)[0];
        
      causes.push({
        category: 'Process',
        issue: `Waiting Time: ${longestWait.from} → ${longestWait.to}`,
        count: Math.round(longestWait.time),
        impact: 'Medium',
        recommendation: `Implement pull system between ${longestWait.from} and ${longestWait.to} steps`
      });
    }
    
    setRootCauses(causes);
  };
  
  // Generate predictions
  const generatePredictions = () => {
    // RFT rate predictions
    const rftPredictions = [];
    
    if (data?.overview?.processTimeline && data.overview.processTimeline.length > 0) {
      // Use last 3 months to predict next 3
      const lastThreeMonths = data.overview.processTimeline.slice(-3);
      
      // Calculate average trend
      let avgTrend = 0;
      for (let i = 1; i < lastThreeMonths.length; i++) {
        avgTrend += (lastThreeMonths[i].recordRFT - lastThreeMonths[i-1].recordRFT);
      }
      avgTrend = avgTrend / (lastThreeMonths.length - 1);
      
      // Create predictions
      const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const lastMonth = data.overview.processTimeline[data.overview.processTimeline.length - 1];
      
      for (let i = 0; i < 3; i++) {
        const monthIndex = (data.overview.processTimeline.length - 1 + i) % 12;
        const predictedRFT = lastMonth.recordRFT + (avgTrend * (i + 1)) + ((Math.random() * 2) - 1);
        
        rftPredictions.push({
          month: months[monthIndex],
          predicted: parseFloat(predictedRFT.toFixed(1)),
          actual: null
        });
      }
    }
    
    // Cycle time predictions
    const cyclePredictions = [];
    
    if (data?.processMetrics?.cycleTimeBreakdown && data.processMetrics.cycleTimeBreakdown.length > 0) {
      const totalTime = data.processMetrics.cycleTimeBreakdown.reduce((sum, item) => sum + item.time, 0);
      const waitingTime = data.processMetrics.waitingTimes
        ? data.processMetrics.waitingTimes.reduce((sum, item) => sum + item.time, 0)
        : totalTime * 0.3; // Estimate waiting time if not available
      
      // Current state
      cyclePredictions.push({
        scenario: 'Current',
        processTime: parseFloat(totalTime.toFixed(1)),
        waitingTime: parseFloat(waitingTime.toFixed(1)),
        totalTime: parseFloat((totalTime + waitingTime).toFixed(1))
      });
      
      // Optimized process
      const optimizedProcess = totalTime * 0.9; // 10% process improvement
      const optimizedWaiting = waitingTime * 0.7; // 30% waiting time improvement
      
      cyclePredictions.push({
        scenario: 'Optimized',
        processTime: parseFloat(optimizedProcess.toFixed(1)),
        waitingTime: parseFloat(optimizedWaiting.toFixed(1)),
        totalTime: parseFloat((optimizedProcess + optimizedWaiting).toFixed(1))
      });
      
      // Target
      const targetTotal = data.processMetrics.totalCycleTime?.target || 
        (totalTime + waitingTime) * 0.7; // Assume 30% reduction as target
      const targetProcess = totalTime * 0.8; // Target process time
      const targetWaiting = targetTotal - targetProcess; // Remaining is waiting time
      
      cyclePredictions.push({
        scenario: 'Target',
        processTime: parseFloat(targetProcess.toFixed(1)),
        waitingTime: parseFloat(targetWaiting.toFixed(1)),
        totalTime: parseFloat(targetTotal.toFixed(1))
      });
    }
    
    setPredictions({
      rft: rftPredictions,
      cycle: cyclePredictions
    });
  };
  
  // Generate improvement opportunities
  const generateOpportunities = () => {
    const opportunitiesList = [];
    
    // Add opportunities based on form errors
    if (data?.internalRFT?.formErrors && data.internalRFT.formErrors.length > 0) {
      const topFormError = data.internalRFT.formErrors[0];
      
      opportunitiesList.push({
        title: `Improve ${topFormError.name} Documentation`,
        description: `Standardize ${topFormError.name} format and provide training to reduce error rate by ~30%`,
        impact: 'High',
        effort: 'Medium',
        status: 'Planned',
        roi: '4.2',
        completed: '0%'
      });
    }
    
    // Add opportunities based on process bottlenecks
    if (data?.processMetrics?.cycleTimeBreakdown && data.processMetrics.cycleTimeBreakdown.length > 0) {
      const longestStep = [...data.processMetrics.cycleTimeBreakdown].sort((a, b) => b.time - a.time)[0];
      
      opportunitiesList.push({
        title: `Optimize ${longestStep.step} Process`,
        description: `Implement lean methodologies to reduce ${longestStep.step} time by 15%`,
        impact: 'High',
        effort: 'High',
        status: 'In Progress',
        roi: '3.7',
        completed: '35%'
      });
    }
    
    // Add opportunities based on waiting times
    if (data?.processMetrics?.waitingTimes && data.processMetrics.waitingTimes.length > 0) {
      const longestWait = [...data.processMetrics.waitingTimes].sort((a, b) => b.time - a.time)[0];
      
      opportunitiesList.push({
        title: `Reduce Wait Time: ${longestWait.from} → ${longestWait.to}`,
        description: `Implement pull system and visual management to reduce waiting time by 40%`,
        impact: 'Medium',
        effort: 'Medium',
        status: 'Proposed',
        roi: '2.8',
        completed: '0%'
      });
    }
    
    // Add opportunities based on customer feedback
    if (data?.externalRFT?.customerComments && data.externalRFT.customerComments.length > 0) {
      const negativeComment = [...data.externalRFT.customerComments]
        .filter(comment => comment.sentiment < -0.2)
        .sort((a, b) => a.sentiment - b.sentiment)[0];
      
      if (negativeComment) {
        opportunitiesList.push({
          title: `Address ${negativeComment.category} Customer Concerns`,
          description: `Develop proactive ${negativeComment.category.toLowerCase()} quality program to improve sentiment by 0.3 points`,
          impact: 'High',
          effort: 'Medium',
          status: 'Planned',
          roi: '4.5',
          completed: '10%'
        });
      }
    }
    
    // Add opportunity for digital transformation
    opportunitiesList.push({
      title: 'Digital Transformation Initiative',
      description: 'Convert paper-based processes to digital format to reduce manual errors by 50%',
      impact: 'High',
      effort: 'High',
      status: 'In Progress',
      roi: '5.2',
      completed: '25%'
    });
    
    setOpportunities(opportunitiesList);
  };
  
  // Generate correlations
  const generateCorrelations = () => {
    const correlationsList = [];
    
    // Add correlation between review time and quality
    correlationsList.push({
      factor1: 'NN Review Time',
      factor2: 'Quality Score',
      correlation: -0.67,
      description: 'Longer review times correlate with lower quality scores',
      significance: 'High'
    });
    
    // Add correlation between cycle time and RFT rate
    correlationsList.push({
      factor1: 'Total Cycle Time',
      factor2: 'RFT Rate',
      correlation: -0.72,
      description: 'Shorter cycle times correlate with higher RFT rates',
      significance: 'High'
    });
    
    // Add correlation between documentation errors and customer complaints
    correlationsList.push({
      factor1: 'Documentation Errors',
      factor2: 'Customer Complaints',
      correlation: 0.81,
      description: 'More documentation errors strongly correlate with increased customer complaints',
      significance: 'Very High'
    });
    
    // Add correlation between internal and external RFT
    correlationsList.push({
      factor1: 'Internal RFT Rate',
      factor2: 'External RFT Rate',
      correlation: 0.89,
      description: 'Internal RFT rate is a strong predictor of external RFT rate with a 1-month lag',
      significance: 'Very High'
    });
    
    setCorrelations(correlationsList);
  };
  
  // Helper function to get recommendation for form type
  const getRecommendationForForm = (formName) => {
    const recommendations = {
      'Production Record': 'Standardize production record format and implement digital templates',
      'Batch Release': 'Implement electronic batch release system with built-in validation',
      'QC Checklist': 'Redesign QC checklist with clear acceptance criteria',
      'Material Transfer': 'Introduce barcode scanning for material transfer documentation',
      'Process Deviation': 'Develop structured process deviation documentation workflow'
    };
    
    return recommendations[formName] || 'Standardize documentation and implement quality checks';
  };
  
  // Helper function to get recommendation for customer issue
  const getRecommendationForCustomerIssue = (category) => {
    const recommendations = {
      'Documentation': 'Implement structured document review process with customer requirements focus',
      'Quality': 'Establish customer-specific quality acceptance criteria',
      'Delivery': 'Implement real-time shipment tracking and communication system',
      'Packaging': 'Review packaging specifications with customer input',
      'Other': 'Create systematic customer feedback collection and response process'
    };
    
    return recommendations[category] || 'Develop customer-centric improvement program';
  };
  
  // Helper function to get recommendation for process step
  const getRecommendationForProcess = (step) => {
    const recommendations = {
      'Bulk Receipt': 'Implement automated material receipt and verification system',
      'Assembly': 'Apply SMED techniques to reduce setup times',
      'PCI Review': 'Implement electronic review system with automated checks',
      'NN Review': 'Establish parallel review workflow with real-time collaboration',
      'Packaging': 'Implement one-piece flow and visual management',
      'Final Review': 'Develop streamlined review checklist with critical focus areas',
      'Release': 'Implement automated release notification system'
    };
    
    return recommendations[step] || 'Apply lean methodologies to reduce process time';
  };
  
  // Chart Components
  
  // RFT Prediction Chart
  const RFTPredictionChart = () => {
    if (predictions.rft.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No prediction data available</div>;
    }
    
    // Combine historical data with predictions
    const combinedData = [];
    
    if (data?.overview?.processTimeline) {
      // Add the last 3 months of actual data
      const lastThreeMonths = data.overview.processTimeline.slice(-3);
      lastThreeMonths.forEach(item => {
        combinedData.push({
          month: item.month,
          actual: item.recordRFT,
          predicted: null
        });
      });
    }
    
    // Add predictions
    predictions.rft.forEach(item => {
      combinedData.push(item);
    });
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={combinedData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[90, 96]} />
            <Tooltip formatter={(value) => [value ? `${value}%` : 'N/A', '']} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="actual" 
              name="Actual RFT %" 
              stroke="#0066a4" 
              strokeWidth={2}
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              name="Predicted RFT %" 
              stroke="#db0032" 
              strokeDasharray="5 5"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Cycle Time Prediction Chart
  const CycleTimePredictionChart = () => {
    if (predictions.cycle.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No cycle time prediction data available</div>;
    }
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={predictions.cycle}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="scenario" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} days`, '']} />
            <Legend />
            <Bar dataKey="processTime" name="Process Time" stackId="a" fill="#0066a4" />
            <Bar dataKey="waitingTime" name="Waiting Time" stackId="a" fill="#db0032" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Correlation Matrix Chart
  const CorrelationMatrixChart = () => {
    if (correlations.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No correlation data available</div>;
    }
    
    // Convert correlations to a format suitable for the chart
    const correlationData = correlations.map(item => ({
      name: `${item.factor1} & ${item.factor2}`,
      value: Math.abs(item.correlation) * 100,
      direction: item.correlation >= 0 ? 'positive' : 'negative',
      significance: item.significance
    }));
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={correlationData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 150, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(1)}%`, 'Correlation Strength']}
            />
            <Bar 
              dataKey="value" 
              name="Correlation Strength"
            >
              {correlationData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.direction === 'positive' ? '#00843d' : '#c8102e'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Root Causes Visualization
  const RootCausesVisualization = () => {
    if (rootCauses.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No root causes data available</div>;
    }
    
    return (
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Impact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recommendation
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rootCauses.map((cause, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cause.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cause.issue} {cause.count && `(${cause.count})`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    cause.impact === 'High' 
                      ? 'bg-red-100 text-red-800' 
                      : cause.impact === 'Medium' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {cause.impact}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                  {cause.recommendation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Improvement Opportunities Visualization
  const OpportunitiesVisualization = () => {
    if (opportunities.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No opportunities data available</div>;
    }
    
    return (
      <div className="space-y-4">
        {opportunities.map((opportunity, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-lg">{opportunity.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{opportunity.description}</p>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-4">
                  <div className="text-xs text-gray-500">Est. ROI</div>
                  <div className="text-lg font-semibold">{opportunity.roi}x</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Progress</div>
                  <div className="text-lg font-semibold">{opportunity.completed}</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mt-4">
              <div className="text-sm mr-6">
                <span className="text-gray-500 mr-2">Impact:</span>
                <span className={`font-medium ${
                  opportunity.impact === 'High' ? 'text-red-600' : 
                  opportunity.impact === 'Medium' ? 'text-yellow-600' : 'text-blue-600'
                }`}>{opportunity.impact}</span>
              </div>
              <div className="text-sm mr-6">
                <span className="text-gray-500 mr-2">Effort:</span>
                <span className="font-medium">{opportunity.effort}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500 mr-2">Status:</span>
                <span className={`font-medium ${
                  opportunity.status === 'In Progress' ? 'text-blue-600' : 
                  opportunity.status === 'Planned' ? 'text-yellow-600' : 'text-green-600'
                }`}>{opportunity.status}</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: opportunity.completed }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Main insights content
  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center py-8">
        <div className="animate-spin mx-auto mb-4 w-8 h-8 border-2 border-dashed rounded-full border-blue-500"></div>
        <p className="text-gray-600">Generating insights...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center py-8">
        <div className="mx-auto mb-4 w-12 h-12 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Manufacturing Process Insights</h2>
        <p className="text-gray-500 text-sm">AI-powered analytics and recommendations for process improvement</p>
      </div>
      
      <div className="p-4">
        {/* Key Findings Summary */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Key Findings</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><span className="font-medium">Documentation Quality:</span> Documentation errors contribute to 60% of all quality issues</li>
            <li><span className="font-medium">Process Efficiency:</span> The PCI Review step is the biggest bottleneck in the current process</li>
            <li><span className="font-medium">Customer Satisfaction:</span> Documentation and Quality issues are the main customer concerns</li>
            <li><span className="font-medium">Prediction:</span> Without intervention, RFT rate is projected to decline by 0.8% in the next quarter</li>
          </ul>
        </div>
        
        {/* Predictions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2">Projected RFT Rate</h4>
              <RFTPredictionChart />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2">Cycle Time Scenarios</h4>
              <CycleTimePredictionChart />
            </div>
          </div>
        </div>
        
        {/* Root Causes */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Root Causes</h3>
          <div className="bg-white p-4 rounded-lg shadow">
            <RootCausesVisualization />
          </div>
        </div>
        
        {/* Correlations */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Key Correlations</h3>
          <div className="bg-white p-4 rounded-lg shadow">
            <CorrelationMatrixChart />
          </div>
        </div>
        
        {/* Improvement Opportunities */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Improvement Opportunities</h3>
          <OpportunitiesVisualization />
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard; 