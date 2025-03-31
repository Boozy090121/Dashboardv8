/**
 * Utility functions for the Novo Nordisk Dashboard
 */

/**
 * Format number with commas as thousands separators
 * @param {Number} number - The number to format
 * @param {Number} decimals - Number of decimal places (default: 0)
 * @returns {String} - Formatted number
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return 'N/A';
  
  return number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format percentage
 * @param {Number} number - The number to format as percentage
 * @param {Number} decimals - Number of decimal places (default: 1)
 * @returns {String} - Formatted percentage
 */
export const formatPercentage = (number, decimals = 1) => {
  if (number === null || number === undefined) return 'N/A';
  
  return number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }) + '%';
};

/**
 * Format date
 * @param {Date|String} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {String} - Formatted date
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Calculate percentage change between two values
 * @param {Number} current - Current value
 * @param {Number} previous - Previous value
 * @returns {Number} - Percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

/**
 * Calculate moving average
 * @param {Array} data - Array of values
 * @param {Number} period - Period for moving average
 * @returns {Array} - Moving averages
 */
export const calculateMovingAverage = (data, period = 3) => {
  const result = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      // Not enough data points yet
      result.push(null);
    } else {
      // Calculate average of last 'period' values
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      result.push(sum / period);
    }
  }
  
  return result;
};

/**
 * Export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of column headers
 * @param {String} filename - Filename for the CSV
 */
export const exportToCSV = (data, headers, filename = 'export.csv') => {
  // Create header row
  const headerRow = headers.map(h => `"${h.text}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(header => {
      const value = item[header.value];
      // Wrap strings in quotes and escape any quotes within the string
      return typeof value === 'string' ? 
        `"${value.replace(/"/g, '""')}"` : 
        value;
    }).join(',');
  });
  
  // Combine all rows
  const csvContent = [headerRow, ...dataRows].join('\n');
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Calculate statistics for an array of values
 * @param {Array} data - Array of numeric values
 * @returns {Object} - Statistics
 */
export const calculateStatistics = (data) => {
  if (!data || data.length === 0) {
    return {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      standardDeviation: 0
    };
  }
  
  // Filter out non-numeric values
  const numericData = data.filter(val => typeof val === 'number' && !isNaN(val));
  
  if (numericData.length === 0) {
    return {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      standardDeviation: 0
    };
  }
  
  // Sort data for median calculation
  const sortedData = [...numericData].sort((a, b) => a - b);
  
  // Calculate min, max
  const min = sortedData[0];
  const max = sortedData[sortedData.length - 1];
  
  // Calculate mean
  const sum = sortedData.reduce((acc, val) => acc + val, 0);
  const mean = sum / sortedData.length;
  
  // Calculate median
  let median;
  const midpoint = Math.floor(sortedData.length / 2);
  
  if (sortedData.length % 2 === 0) {
    // Even number of elements, average the middle two
    median = (sortedData[midpoint - 1] + sortedData[midpoint]) / 2;
  } else {
    // Odd number of elements, take the middle one
    median = sortedData[midpoint];
  }
  
  // Calculate standard deviation
  const squareDiffs = sortedData.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  
  const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / squareDiffs.length;
  const standardDeviation = Math.sqrt(avgSquareDiff);
  
  return {
    min,
    max,
    mean,
    median,
    standardDeviation
  };
};

/**
 * Group data by a specific field
 * @param {Array} data - Array of objects
 * @param {String} field - Field to group by
 * @returns {Object} - Grouped data
 */
export const groupBy = (data, field) => {
  return data.reduce((groups, item) => {
    const key = item[field];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Calculate Pareto analysis (80/20 rule)
 * @param {Array} data - Array of objects with name and value properties
 * @returns {Array} - Data with cumulative values and percentages
 */
export const calculateParetoData = (data) => {
  // Sort data by value in descending order
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Calculate total
  const total = sortedData.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate percentages and cumulative values
  let cumulative = 0;
  
  return sortedData.map(item => {
    const percentage = (item.value / total) * 100;
    cumulative += item.value;
    const cumulativePercentage = (cumulative / total) * 100;
    
    return {
      name: item.name,
      value: item.value,
      percentage: parseFloat(percentage.toFixed(1)),
      cumulative,
      cumulativePercentage: parseFloat(cumulativePercentage.toFixed(1))
    };
  });
};

export default {
  formatNumber,
  formatPercentage,
  formatDate,
  calculatePercentageChange,
  calculateMovingAverage,
  exportToCSV,
  calculateStatistics,
  groupBy,
  calculateParetoData
};
