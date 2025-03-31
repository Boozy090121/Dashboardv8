import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const CustomerCommentAnalysis = () => {
  // Comment analysis data - would be populated from the Excel files in a real implementation
  const [commentData, setCommentData] = useState({
    commentsByCategory: [
      { category: 'Documentation', count: 38, percentage: 28.4 },
      { category: 'Quality Issues', count: 27, percentage: 20.1 },
      { category: 'Delivery Delays', count: 22, percentage: 16.4 },
      { category: 'Packaging Problems', count: 18, percentage: 13.4 },
      { category: 'Communication', count: 16, percentage: 11.9 },
      { category: 'Product Specifications', count: 13, percentage: 9.7 }
    ],
    sentimentAnalysis: {
      positive: 21,
      neutral: 48,
      negative: 65
    },
    trendsOverTime: [
      { month: 'Jan', Documentation: 8, Quality: 6, Delivery: 4, Packaging: 3 },
      { month: 'Feb', Documentation: 7, Quality: 5, Delivery: 5, Packaging: 4 },
      { month: 'Mar', Documentation: 6, Quality: 6, Delivery: 3, Packaging: 3 },
      { month: 'Apr', Documentation: 5, Quality: 4, Delivery: 5, Packaging: 2 },
      { month: 'May', Documentation: 6, Quality: 3, Delivery: 3, Packaging: 3 },
      { month: 'Jun', Documentation: 6, Quality: 3, Delivery: 2, Packaging: 3 }
    ],
    resolutionRates: [
      { category: 'Documentation', resolved: 31, pending: 7 },
      { category: 'Quality Issues', resolved: 20, pending: 7 },
      { category: 'Delivery Delays', resolved: 19, pending: 3 },
      { category: 'Packaging Problems', resolved: 15, pending: 3 },
      { category: 'Communication', resolved: 13, pending: 3 },
      { category: 'Product Specifications', resolved: 10, pending: 3 }
    ],
    repeatedVsNew: {
      repeated: 73,
      new: 61
    },
    sampleComments: [
      { 
        id: 1, 
        category: 'Documentation', 
        comment: 'Certificate of Analysis missing key test result for viscosity.', 
        sentiment: 'negative',
        dateReceived: '2025-03-02',
        status: 'Resolved'
      },
      { 
        id: 2, 
        category: 'Quality Issues', 
        comment: 'Product shows inconsistent dissolution rate between batches.', 
        sentiment: 'negative',
        dateReceived: '2025-03-10',
        status: 'Pending'
      },
      { 
        id: 3, 
        category: 'Delivery Delays', 
        comment: 'Last three shipments have been 2-3 days late without notification.', 
        sentiment: 'negative',
        dateReceived: '2025-02-28',
        status: 'Resolved'
      },
      { 
        id: 4, 
        category: 'Packaging Problems', 
        comment: 'Secondary packaging showed water damage on receipt.', 
        sentiment: 'negative',
        dateReceived: '2025-03-15',
        status: 'Resolved'
      },
      { 
        id: 5, 
        category: 'Communication', 
        comment: 'Appreciate the proactive notification about potential delays.', 
        sentiment: 'positive',
        dateReceived: '2025-03-08',
        status: 'No action needed'
      }
    ]
  });
  
  // Colors from Novo Nordisk spec
  const colors = {
    primary: '#db0032', // Novo Nordisk Red
    secondary: '#0066a4', // Complementary Blue
    tertiary: '#00a0af', // Teal Accent
    success: '#00843d', // Green
    warning: '#ffc72c', // Amber
    danger: '#c8102e', // Alert Red
    lightText: '#6c757d',
    chartColors: ['#db0032', '#0066a4', '#00a0af', '#00843d', '#ffc72c', '#c8102e'],
    sentimentColors: {
      positive: '#00843d',
      neutral: '#6c757d',
      negative: '#c8102e'
    }
  };
  
  // Filter states
  const [timeRange, setTimeRange] = useState('6m');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Comment Categories Chart
  const CommentCategoriesChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={commentData.commentsByCategory}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="category"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {commentData.commentsByCategory.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors.chartColors[index % colors.chartColors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} comments`, 'Count']} />
            <Legend layout="vertical" verticalAlign="middle" align="right" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Sentiment Analysis Chart
  const SentimentAnalysisChart = () => {
    const sentimentData = [
      { name: 'Positive', value: commentData.sentimentAnalysis.positive },
      { name: 'Neutral', value: commentData.sentimentAnalysis.neutral },
      { name: 'Negative', value: commentData.sentimentAnalysis.negative }
    ];
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sentimentData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              <Cell key="cell-positive" fill={colors.sentimentColors.positive} />
              <Cell key="cell-neutral" fill={colors.sentimentColors.neutral} />
              <Cell key="cell-negative" fill={colors.sentimentColors.negative} />
            </Pie>
            <Tooltip formatter={(value) => [`${value} comments`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Trends Over Time Chart
  const TrendsOverTimeChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={commentData.trendsOverTime}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Documentation" 
              stroke={colors.primary} 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="Quality" 
              stroke={colors.secondary} 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="Delivery" 
              stroke={colors.tertiary} 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="Packaging" 
              stroke={colors.warning} 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Resolution Rates Chart
  const ResolutionRatesChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={commentData.resolutionRates}
            margin={{ top: 10, right: 30, left: 0, bottom: 70 }}
            barSize={36}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="category" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="resolved" name="Resolved" stackId="a" fill={colors.success} />
            <Bar dataKey="pending" name="Pending" stackId="a" fill={colors.warning} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Repeated vs New Issues
  const RepeatedVsNewChart = () => {
    const repeatedVsNewData = [
      { name: 'Repeated Issues', value: commentData.repeatedVsNew.repeated },
      { name: 'New Issues', value: commentData.repeatedVsNew.new }
    ];
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={repeatedVsNewData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              <Cell key="cell-repeated" fill={colors.danger} />
              <Cell key="cell-new" fill={colors.secondary} />
            </Pie>
            <Tooltip formatter={(value) => [`${value} issues`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Comments Table with sentiment indicators
  const CommentsTable = () => {
    const getSentimentBadge = (sentiment) => {
      const badgeColors = {
        positive: 'bg-green-100 text-green-800',
        neutral: 'bg-gray-100 text-gray-800',
        negative: 'bg-red-100 text-red-800'
      };
      
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColors[sentiment]}`}>
          {sentiment === 'positive' ? '😊' : sentiment === 'negative' ? '😟' : '😐'} {sentiment}
        </span>
      );
    };
    
    const getStatusBadge = (status) => {
      let badgeColors = 'bg-gray-100 text-gray-800';
      
      if (status === 'Resolved') {
        badgeColors = 'bg-green-100 text-green-800';
      } else if (status === 'Pending') {
        badgeColors = 'bg-yellow-100 text-yellow-800';
      } else if (status === 'No action needed') {
        badgeColors = 'bg-blue-100 text-blue-800';
      }
      
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColors}`}>
          {status}
        </span>
      );
    };
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sentiment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Received
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {commentData.sampleComments.map((comment) => (
              <tr key={comment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comment.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.category}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{comment.comment}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getSentimentBadge(comment.sentiment)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.dateReceived}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getStatusBadge(comment.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Filter Controls
  const FilterControls = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Time Range</label>
            <select 
              className="border rounded-md px-3 py-1 text-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <select 
              className="border rounded-md px-3 py-1 text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="documentation">Documentation</option>
              <option value="quality">Quality Issues</option>
              <option value="delivery">Delivery Delays</option>
              <option value="packaging">Packaging Problems</option>
              <option value="communication">Communication</option>
              <option value="specifications">Product Specifications</option>
            </select>
          </div>
        </div>
        
        <div>
          <button className="px-3 py-1 bg-gray-100 rounded-md text-sm mr-2">
            Export Data
          </button>
          <button className="px-3 py-1 bg-gray-100 rounded-md text-sm">
            Set Alerts
          </button>
        </div>
      </div>
    );
  };
  
  // Key Metrics Summary
  const KeyMetricsSummary = () => {
    // Calculate total comments
    const totalComments = Object.values(commentData.sentimentAnalysis).reduce((acc, val) => acc + val, 0);
    
    // Calculate resolution rate
    const totalResolved = commentData.resolutionRates.reduce((acc, item) => acc + item.resolved, 0);
    const totalIssues = commentData.resolutionRates.reduce((acc, item) => acc + item.resolved + item.pending, 0);
    const resolutionRate = Math.round((totalResolved / totalIssues) * 100);
    
    // Calculate negative sentiment percentage
    const negativePercentage = Math.round((commentData.sentimentAnalysis.negative / totalComments) * 100);
    
    // Calculate repeated issues percentage
    const repeatedPercentage = Math.round((commentData.repeatedVsNew.repeated / (commentData.repeatedVsNew.repeated + commentData.repeatedVsNew.new)) * 100);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customer Comments</p>
              <h2 className="text-2xl font-bold">{totalComments}</h2>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resolution Rate</p>
              <h2 className="text-2xl font-bold">{resolutionRate}%</h2>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Negative Sentiment</p>
              <h2 className="text-2xl font-bold">{negativePercentage}%</h2>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Repeated Issues</p>
              <h2 className="text-2xl font-bold">{repeatedPercentage}%</h2>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Insights Panel
  const InsightsPanel = () => {
    return (
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Emerging Themes</h4>
            <ul className="text-sm text-blue-800 list-disc pl-5 space-y-1">
              <li>Documentation issues remain the most common customer concern (28.4%)</li>
              <li>Quality issues are showing a consistent downward trend month-to-month</li>
              <li>Communication-related comments have improved by 24% over prior period</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Action Recommendations</h4>
            <ul className="text-sm text-blue-800 list-disc pl-5 space-y-1">
              <li>Implement enhanced documentation QC process for most frequent issues</li>
              <li>Conduct root cause analysis on repeated delivery delay concerns</li>
              <li>Schedule customer feedback session to address recurring packaging complaints</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Customer Comment Analysis</h2>
        <p className="text-sm text-gray-600">Text analysis of customer comments with theme extraction and sentiment analysis</p>
      </div>
      
      <FilterControls />
      <KeyMetricsSummary />
      <InsightsPanel />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Comment Categories</h3>
          <p className="text-sm text-gray-500 mb-2">Distribution of comments by category</p>
          <CommentCategoriesChart />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Sentiment Analysis</h3>
          <p className="text-sm text-gray-500 mb-2">Customer comment sentiment distribution</p>
          <SentimentAnalysisChart />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Comment Trends Over Time</h3>
          <p className="text-sm text-gray-500 mb-2">Top categories trends by month</p>
          <TrendsOverTimeChart />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Resolution Rates by Category</h3>
          <p className="text-sm text-gray-500 mb-2">Status of issue resolution by category</p>
          <ResolutionRatesChart />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Repeated vs. New Issues</h3>
          <p className="text-sm text-gray-500 mb-2">Distribution of recurring vs. first-time issues</p>
          <RepeatedVsNewChart />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Recommended Actions</h3>
          <div className="space-y-3 mt-4">
            <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
              <h4 className="font-medium text-blue-800">Documentation Process Review</h4>
              <p className="text-sm text-blue-700">Revise Certificate of Analysis format to highlight test parameters frequently cited in customer complaints.</p>
            </div>
            
            <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
              <h4 className="font-medium text-blue-800">Quality Consistency Program</h4>
              <p className="text-sm text-blue-700">Implement additional inter-batch testing to address dissolution rate variation feedback.</p>
            </div>
            
            <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
              <h4 className="font-medium text-blue-800">Delivery Notification System</h4>
              <p className="text-sm text-blue-700">Deploy automated notifications for any shipping delays exceeding 24 hours from scheduled delivery.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Sample Customer Comments</h3>
        <p className="text-sm text-gray-500 mb-4">Recent customer feedback with sentiment analysis</p>
        <CommentsTable />
      </div>
    </div>
  );
};

export default CustomerCommentAnalysis;
