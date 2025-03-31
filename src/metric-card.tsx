import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Info, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const MetricCard = ({
  title,
  value,
  previousValue,
  change,
  percentage = false,
  currency = false,
  trend = 'up', // 'up', 'down', 'neutral'
  trendData = [],
  status = 'normal', // 'normal', 'warning', 'critical', 'success'
  goal,
  goalLabel = 'Goal',
  description,
  onClick,
  showDetails = false,
  className = '',
  detailMetrics = [],
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  // State for showing description tooltip
  const [showTooltip, setShowTooltip] = useState(false);
  // State for showing metric details
  const [showMetricDetails, setShowMetricDetails] = useState(false);
  
  // Format the value based on type (percentage or currency)
  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    
    if (percentage) {
      return `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
    }
    
    if (currency) {
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    return val.toLocaleString();
  };
  
  // Calculate the change percentage if not provided
  const calculateChange = () => {
    if (change !== undefined) return change;
    
    if (previousValue === 0) return 0;
    if (previousValue === undefined || previousValue === null) return 0;
    
    return ((value - previousValue) / Math.abs(previousValue)) * 100;
  };
  
  // Determine if the change is positive or negative
  const changePercentage = calculateChange();
  const isPositive = trend === 'up' ? changePercentage > 0 : changePercentage < 0;
  const isNegative = trend === 'up' ? changePercentage < 0 : changePercentage > 0;
  
  // Determine status color
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };
  
  // Determine the trend icon and color
  const getTrendIcon = () => {
    if (isPositive) {
      return (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <TrendingUp size={size === 'small' ? 14 : 16} className="mr-1" />
          <span className="text-xs font-medium">
            {Math.abs(changePercentage).toFixed(1)}%
          </span>
        </div>
      );
    } else if (isNegative) {
      return (
        <div className="flex items-center text-red-600 dark:text-red-400">
          <TrendingDown size={size === 'small' ? 14 : 16} className="mr-1" />
          <span className="text-xs font-medium">
            {Math.abs(changePercentage).toFixed(1)}%
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <span className="text-xs font-medium">0%</span>
        </div>
      );
    }
  };
  
  // Calculate progress towards goal
  const calculateProgress = () => {
    if (goal === undefined || goal === null) return 0;
    
    return Math.min(100, Math.max(0, (value / goal) * 100));
  };
  
  // Generate default trend data if not provided
  const generateTrendData = () => {
    if (trendData && trendData.length > 0) return trendData;
    
    // Generate mock trend data
    return Array(10).fill().map((_, i) => ({
      value: Math.random() * (isPositive ? value * 1.2 : value * 0.8)
    }));
  };
  
  // Ensure we have trend data
  const chartData = generateTrendData();
  
  // Handle card click
  const handleCardClick = () => {
    if (onClick) onClick();
    
    // Toggle metric details if onClick is not provided
    if (!onClick && showDetails) {
      setShowMetricDetails(!showMetricDetails);
    }
  };
  
  // Get the appropriate size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          card: 'p-3',
          title: 'text-xs',
          value: 'text-lg',
          chart: 40
        };
      case 'large':
        return {
          card: 'p-5',
          title: 'text-sm',
          value: 'text-3xl',
          chart: 80
        };
      default:
        return {
          card: 'p-4',
          title: 'text-xs',
          value: 'text-2xl',
          chart: 60
        };
    }
  };
  
  const sizeClasses = getSizeClasses();
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${sizeClasses.card} cursor-pointer transition-all duration-300 hover:shadow-md ${className}`}
      onClick={handleCardClick}
    >
      {/* Header with title and status indicator */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <h3 className={`${sizeClasses.title} text-gray-600 dark:text-gray-400 font-medium`}>
            {title}
          </h3>
          
          {description && (
            <div className="relative inline-block ml-1">
              <Info 
                size={size === 'small' ? 12 : 14} 
                className="text-gray-400 cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              />
              
              {showTooltip && (
                <div className="absolute z-10 w-64 p-2 mt-1 text-xs text-white bg-gray-900 rounded-md shadow-lg -left-2">
                  {description}
                </div>
              )}
            </div>
          )}
        </div>
        
        {status !== 'normal' && (
          <div className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor()}`}>
            {status === 'critical' && 'Critical'}
            {status === 'warning' && 'Warning'}
            {status === 'success' && 'Excellent'}
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-end mb-2">
        {/* Main value */}
        <div className="flex-1">
          <h2 className={`${sizeClasses.value} font-bold text-gray-800 dark:text-white`}>
            {formatValue(value)}
          </h2>
          
          <div className="flex items-center mt-1">
            {getTrendIcon()}
            
            {previousValue !== undefined && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                vs {formatValue(previousValue)}
              </span>
            )}
          </div>
        </div>
        
        {/* Sparkline chart */}
        <div className="w-24">
          <ResponsiveContainer width="100%" height={sizeClasses.chart}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradientColor_${title.replace(/\s+/g, '_')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#00843d" : "#c8102e"} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={isPositive ? "#00843d" : "#c8102e"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip content={<></>} /> {/* Empty tooltip */}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? "#00843d" : "#c8102e"} 
                fillOpacity={1} 
                fill={`url(#gradientColor_${title.replace(/\s+/g, '_')})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Goal progress */}
      {goal !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{goalLabel}</span>
            <span>{formatValue(goal)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${isPositive ? 'bg-green-600' : 'bg-red-600'}`}
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Detail metrics (expandable) */}
      {showDetails && (
        <div className="mt-3">
          <button 
            className="text-xs text-gray-500 dark:text-gray-400 flex items-center w-full justify-between"
            onClick={(e) => {
              e.stopPropagation();
              setShowMetricDetails(!showMetricDetails);
            }}
          >
            <span>Details</span>
            {showMetricDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {showMetricDetails && detailMetrics.length > 0 && (
            <div className="mt-2 space-y-2">
              {detailMetrics.map((metric, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{metric.label}</span>
                  <span className="font-medium text-gray-800 dark:text-white">{formatValue(metric.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
