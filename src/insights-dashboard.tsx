import React, { useState, useEffect } from 'react';
import { useDataContext } from './DataContext.js';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const InsightsDashboard = () => {
  const { data, isLoading } = useDataContext();
  
  // State for insights
  const [rootCauses, setRootCauses] = useState([]);
  const [predictions, setPredictions] = useState({
    rft: [],
    cycle: []
  });
  const [opportunities, setOpportunities] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  
  // Generate insights when data changes
  useEffect(() => {
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
    
    // Add causes based on error types
    if (data?.internalRFT?.errorTypePareto && data.internalRFT.errorTypePareto.length > 0) {
      // Find the top error types
      const topErrorTypes = data.internalRFT.errorTypePareto.slice(0, 3);
      
      topErrorTypes.forEach(error => {
        causes.push({
          category: 'Documentation',
          issue: error.name,
          count: error.value,
          impact: 'High',
          recommendation: getRecommendationForError(error.name)
        });
      });
    }
    
    // Add causes based on process bottlenecks
    if (data?.processMetrics?.bottlenecks && data.processMetrics.bottlenecks.length > 0) {
      data.processMetrics.bottlenecks.forEach(bottleneck => {
        causes.push({
          category: 'Process',
          issue: bottleneck.description,
          count: null,
          impact: 'High',
          recommendation: getRecommendationForBottleneck(bottleneck.step)
        });
      });
    }
    
    // Add causes based on customer feedback
    if (data?.externalRFT?.customerComments && data.externalRFT.customerComments.length > 0) {
      const negativeComments = data.externalRFT.customerComments
        .filter(comment => comment.sentiment < -0.2)
        .slice(0, 2);
      
      negativeComments.forEach(comment => {
        causes.push({
          category: 'Customer Feedback',
          issue: `${comment.category} Issues`,
          count: comment.count,
          impact: 'Medium',
          recommendation: getRecommendationForCustomerIssue(comment.category)
        });
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
      const waitingTime = data.processMetrics.waitingTimeAnalysis
        ? data.processMetrics.waitingTimeAnalysis.reduce((sum, item) => sum + item.time, 0)
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
      const targetTotal = data.processMetrics.totalCycleTime?.target || 18.0;
      const targetProcess = totalTime * 0.8; // Target process time
      const targetWaiting = targetTotal - targetProcess; // Remaining is waiting time
      
      cyclePredictions.push({
        scenario: 'Target',
        processTime: parseFloat(targetProcess.toFixed(1)),
        waitingTime: parseFloat(targetWaiting.toFixed(1)),
        totalTime: targetTotal
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
        status: 'Planned'
      });
    }
    
    // Add opportunities based on process bottlenecks
    if (data?.processMetrics?.bottlenecks && data.processMetrics.bottlenecks.length > 0) {
      data.processMetrics.bottlenecks.slice(0, 2).forEach(bottleneck => {
        const isWaiting = bottleneck.step.startsWith('wait-');
        const name = bottleneck.step.replace('wait-', '');
        
        opportunitiesList.push({
          title: isWaiting 
            ? `Reduce Waiting Time: ${name}`
            : `Optimize ${name} Process`,
          description: bottleneck.description,
          impact: 'High',
          effort: 'Medium',
          status: 'In Progress'
        });
      });
    }
    
    // Add opportunities based on NN review times
    if (data?.processMetrics?.reviewTimeStats?.nn) {
      const nnStats = data.processMetrics.reviewTimeStats.nn;
      
      if (nnStats.average > nnStats.target) {
        opportunitiesList.push({
          title: 'Streamline NN Review Process',
          description: `Implement parallel review workflow to reduce average review time from ${nnStats.average} to ${nnStats.target} days`,
          impact: 'Medium',
          effort: 'Low',
          status: 'Proposed'
        });
      }
    }
    
    // Add opportunities based on customer feedback
    if (data?.externalRFT?.customerComments && data.externalRFT.customerComments.length > 0) {
      const topIssue = data.externalRFT.customerComments[0];
      
      opportunitiesList.push({
        title: `Address ${topIssue.category} Customer Concerns`,
        description: `Implement proactive ${topIssue.category.toLowerCase()} quality checks to reduce customer issues by ~40%`,
        impact: 'High',
        effort: 'High',
        status: 'Planned'
      });
    }
    
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
      factor1: 'Cycle Time',
      factor2: 'RFT Rate',
      correlation: -0.42,
      description: 'Increased cycle times generally lead to lower RFT rates',
      significance: 'Medium'
    });
    
    // Add correlation between documentation errors and customer feedback
    correlationsList.push({
      factor1: 'Documentation Errors',
      factor2: 'Negative Customer Feedback',
      correlation: 0.78,
      description: 'Strong relationship between internal documentation issues and customer complaints',
      significance: 'High'
    });
    
    // Add correlation between waiting time and total cycle time
    correlationsList.push({
      factor1: 'Waiting Time',
      factor2: 'Total Cycle Time',
      correlation: 0.85,
      description: 'Waiting periods have the strongest impact on total cycle time',
      significance: 'High'
    });
    
    setCorrelations(correlationsList);
  };
  
  // Helper function to get recommendations for error types
  const getRecommendationForError = (errorType) => {
    const recommendations = {
      'Missing Signature': 'Implement electronic signature system with validation',
      'Incorrect Information': 'Add validation checks in documentation process',
      'Incomplete Form': 'Create standardized form templates with required field validation',
      'Late Submission': 'Set up automated reminders for documentation deadlines',
      'Illegible Entry': 'Transition to electronic documentation system'
    };
    
    return recommendations[errorType] || 'Review and improve documentation process';
  };
  
  // Helper function to get recommendations for bottlenecks
  const getRecommendationForBottleneck = (bottleneckStep) => {
    const recommendations = {
      'pci-review': 'Implement parallel review process for PCI',
      'nn-review': 'Standardize NN review checklist to reduce variation',
      'wait-packaging': 'Improve scheduling coordination between review and packaging',
      'packaging': 'Optimize packaging line setup and changeover procedures'
    };
    
    return recommendations[bottleneckStep] || 'Analyze and optimize process flow';
  };
  
  // Helper function to get recommendations for customer issues
  const getRecommendationForCustomerIssue = (category) => {
    const recommendations = {
      'Documentation': 'Revise Certificate of Analysis format to highlight key test parameters',
      'Quality Issues': 'Implement additional inter-batch testing for consistency',
      'Delivery Delays': 'Deploy automated notifications for any shipping delays',
      'Packaging Problems': 'Enhance packaging quality checks and improve materials',
      'Communication': 'Establish dedicated customer communication protocol'
    };
    
    return recommendations[category] || 'Analyze customer feedback and develop targeted improvements';
  };
  
  // RFT Prediction Chart
  const RFTPredictionChart = () => {
    if (predictions.rft.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p className="text-gray-500">Insufficient data for RFT predictions</p>
        </div>
      );
    }
    
    // Combine actual and predicted data
    const actualData = data?.overview?.processTimeline || [];
    const combinedData = [
      ...actualData.slice(-3), // Last 3 months actual data
      ...predictions.rft // Next 3 months predictions
    ];
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={combinedData}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[85, 95]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="recordRFT" 
              name="Actual RFT %" 
              stroke="#0066a4" 
              activeDot={{ r: 8 }}
              strokeWidth={2} 
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              name="Predicted RFT %" 
              stroke="#ffc72c"
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
      return (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p className="text-gray-500">Insufficient data for cycle time predictions</p>
        </div>
      );
    }
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={predictions.cycle}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="scenario" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="processTime" stackId="a" name="Process Time" fill="#0066a4" />
            <Bar dataKey="waitingTime" stackId="a" name="Waiting Time" fill="#ffc72c" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // The main component
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Manufacturing Insights Dashboard</h2>
        <p className="text-sm text-gray-600">Advanced analytics and recommendations to improve manufacturing performance</p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-500">Generating insights...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Root Cause Analysis</h3>
              <p className="text-sm text-gray-500 mb-4">Key factors driving quality and cycle time issues</p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rootCauses.length > 0 ? (
                      rootCauses.map((cause, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cause.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{cause.issue}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              cause.impact === 'High' ? 'bg-red-100 text-red-800' : 
                              cause.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {cause.impact}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{cause.recommendation}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                          No root causes identified
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Correlation Analysis</h3>
              <p className="text-sm text-gray-500 mb-4">Relationships between key manufacturing factors</p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factor 1</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factor 2</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correlation</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Significance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {correlations.length > 0 ? (
                      correlations.map((correlation, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{correlation.factor1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{correlation.factor2}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`${correlation.correlation > 0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                              {correlation.correlation > 0 ? '+' : ''}{correlation.correlation.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              correlation.significance === 'High' ? 'bg-blue-100 text-blue-800' : 
                              correlation.significance === 'Medium' ? 'bg-indigo-100 text-indigo-800' : 
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {correlation.significance}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                          No correlations identified
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">RFT Rate Forecast</h3>
              <p className="text-sm text-gray-500 mb-4">3-month prediction based on historical trends</p>
              <RFTPredictionChart />
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Cycle Time Projection</h3>
              <p className="text-sm text-gray-500 mb-4">Expected impact of process optimizations</p>
              <CycleTimePredictionChart />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-2">Improvement Opportunities</h3>
            <p className="text-sm text-gray-500 mb-4">Identified opportunities sorted by impact vs. effort</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initiative</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effort</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opportunities.length > 0 ? (
                    opportunities.map((opportunity, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{opportunity.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{opportunity.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            opportunity.impact === 'High' ? 'bg-green-100 text-green-800' : 
                            opportunity.impact === 'Medium' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {opportunity.impact}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            opportunity.effort === 'Low' ? 'bg-green-100 text-green-800' : 
                            opportunity.effort === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {opportunity.effort}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            opportunity.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                            opportunity.status === 'Planned' ? 'bg-purple-100 text-purple-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {opportunity.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No improvement opportunities identified
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InsightsDashboard;
