/**
 * DataTransformer.js
 * 
 * This module transforms raw records data into a structured format for the
 * Pharmaceutical Process & Quality Dashboard. It processes data for all dashboard tabs
 * including Overview, Internal RFT, External RFT, Process Metrics, and Insights.
 */

import { formatDate, calculateStatistics, calculateParetoData, groupBy } from './utility-functions';

class DataTransformer {
  constructor() {
    this.rawRecords = [];
    this.transformedData = {
      overview: {},
      internalRFT: {},
      externalRFT: {},
      processMetrics: {},
      insights: {},
      deviations: {}, // Placeholder for future implementation
      g7Performance: {} // Placeholder for future implementation
    };
  }

  /**
   * Set raw records data
   * @param {Array} records - Raw records from the JSON file
   */
  setRawData(records) {
    if (!Array.isArray(records)) {
      console.error('Invalid data format: records must be an array');
      return;
    }
    
    this.rawRecords = records;
    console.log(`Loaded ${records.length} records for processing`);
  }

  /**
   * Get transformed data
   * @returns {Object} - Transformed dashboard data
   */
  getTransformedData() {
    if (this.rawRecords.length === 0) {
      console.warn('No data has been loaded for transformation');
    }
    
    return this.transformedData;
  }

  /**
   * Validate a record for required fields
   * @param {Object} record - A single data record
   * @returns {Object} - Validation results with warnings
   */
  validateRecord(record) {
    const warnings = [];
    const requiredFields = ['batchId', 'assembly_start'];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!record[field] || 
          record[field] === '' || 
          record[field] === 'N/A' || 
          record[field] === 'unknown') {
        warnings.push(`Missing or invalid required field: ${field}`);
      }
    });
    
    // Validate assembly_start date (primary date for aggregations)
    if (record.assembly_start && !/^\d{4}-\d{2}-\d{2}/.test(record.assembly_start)) {
      warnings.push(`Invalid assembly_start date format: ${record.assembly_start}`);
    }
    
    return { 
      isValid: warnings.length === 0,
      warnings 
    };
  }

  /**
   * Transform all data for the dashboard
   * @returns {Object} - Complete transformed data
   */
  transformData() {
    try {
      console.log('Starting data transformation...');
      
      // Transform data for each dashboard tab
      this.transformOverviewData();
      this.transformInternalRFTData();
      this.transformExternalRFTData();
      this.transformProcessMetricsData();
      this.transformInsightsData();
      
      // Placeholder transformations
      this.transformDeviationsData();
      this.transformG7PerformanceData();
      
      console.log('Data transformation complete');
      return this.transformedData;
    } catch (error) {
      console.error('Error during data transformation:', error);
      return this.transformedData;
    }
  }

  /**
   * Calculate RFT rate from records
   * @param {Array} records - Array of records
   * @returns {Number} - RFT rate as a percentage
   */
  calculateRFTRate(records) {
    if (!records || records.length === 0) return 0;
    
    const passCount = records.filter(r => !r.hasErrors).length;
    return (passCount / records.length) * 100;
  }

  /**
   * Group records by month
   * @param {Array} records - Array of records
   * @param {String} dateField - Field to use for date grouping
   * @param {Number} monthCount - Number of months to include
   * @returns {Object} - Records grouped by month
   */
  groupRecordsByMonth(records, dateField = 'assembly_start', monthCount = 12) {
    // Filter records with valid date fields
    const validRecords = records.filter(r => r[dateField] && r[dateField] !== 'N/A');
    
    // Create month groups
    const monthGroups = {};
    
    validRecords.forEach(record => {
      const date = new Date(record[dateField]);
      if (!isNaN(date.getTime())) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthGroups[monthKey]) {
          monthGroups[monthKey] = [];
        }
        monthGroups[monthKey].push(record);
      }
    });
    
    // Sort months and limit to last X months
    const sortedMonths = Object.keys(monthGroups).sort().slice(-monthCount);
    
    // Create result object with only the last X months
    const result = {};
    sortedMonths.forEach(month => {
      result[month] = monthGroups[month];
    });
    
    return result;
  }

  /**
   * Analyze error types to find most common issues
   * @param {Array} records - Array of records with errors
   * @param {Number} topCount - Number of top issues to return
   * @returns {Array} - Top error types with count and percentage
   */
  analyzeErrorTypes(records, topCount = 3) {
    if (!records || records.length === 0) return [];
    
    // Filter records with errors
    const recordsWithErrors = records.filter(r => r.hasErrors && r.errorTypes);
    
    // Count error types
    const errorCounts = {};
    
    recordsWithErrors.forEach(record => {
      // Handle errorTypes as either array or comma-separated string
      let errorTypes = record.errorTypes;
      if (typeof errorTypes === 'string') {
        errorTypes = errorTypes.split(',').map(e => e.trim());
      }
      
      if (Array.isArray(errorTypes)) {
        errorTypes.forEach(type => {
          if (!type) return;
          if (!errorCounts[type]) {
            errorCounts[type] = 0;
          }
          errorCounts[type]++;
        });
      }
    });
    
    // Convert to array and sort
    const errorArray = Object.entries(errorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate percentages
    const totalErrors = errorArray.reduce((sum, entry) => sum + entry.count, 0);
    const result = errorArray.map(entry => ({
      name: entry.name,
      count: entry.count,
      percentage: (entry.count / totalErrors) * 100
    }));
    
    return result.slice(0, topCount);
  }

  /**
   * Transform data for the Overview tab
   */
  transformOverviewData() {
    try {
      const records = this.rawRecords;
      if (!records || records.length === 0) return;
      
      // Calculate overall RFT rate
      const overallRFTRate = this.calculateRFTRate(records);
      
      // Calculate average cycle time
      const cycleTimeValues = records
        .map(r => r.cycleTime || r.total_cycle_time_days)
        .filter(val => val && !isNaN(val));
      
      const avgCycleTime = cycleTimeValues.length > 0 
        ? cycleTimeValues.reduce((sum, val) => sum + val, 0) / cycleTimeValues.length 
        : 0;
      
      // Group records by month
      const monthlyGroups = this.groupRecordsByMonth(records, 'assembly_start', 12);
      
      // Calculate monthly metrics
      const monthlyMetrics = Object.entries(monthlyGroups).map(([month, monthRecords]) => {
        const monthRFT = this.calculateRFTRate(monthRecords);
        
        const monthCycleTimes = monthRecords
          .map(r => r.cycleTime || r.total_cycle_time_days)
          .filter(val => val && !isNaN(val));
        
        const avgMonthCycleTime = monthCycleTimes.length > 0 
          ? monthCycleTimes.reduce((sum, val) => sum + val, 0) / monthCycleTimes.length 
          : 0;
        
        return {
          month,
          displayMonth: month.split('-')[1], // Just the month number
          rftRate: monthRFT,
          avgCycleTime: avgMonthCycleTime,
          recordCount: monthRecords.length
        };
      });
      
      // Get top 3 documentation issues
      const topIssues = this.analyzeErrorTypes(records, 3);
      
      // Process improvement summary - compare last 6 months vs previous 6 months
      const sortedMonthKeys = Object.keys(monthlyGroups).sort();
      if (sortedMonthKeys.length >= 12) {
        const recentMonths = sortedMonthKeys.slice(-6);
        const previousMonths = sortedMonthKeys.slice(-12, -6);
        
        const recentRecords = recentMonths.flatMap(month => monthlyGroups[month]);
        const previousRecords = previousMonths.flatMap(month => monthlyGroups[month]);
        
        const improvementSummary = {
          recentRFT: this.calculateRFTRate(recentRecords),
          previousRFT: this.calculateRFTRate(previousRecords),
          rftChange: 0,
          recentAvgCycleTime: 0,
          previousAvgCycleTime: 0,
          cycleTimeChange: 0
        };
        
        // Calculate recent avg cycle time
        const recentCycleTimes = recentRecords
          .map(r => r.cycleTime || r.total_cycle_time_days)
          .filter(val => val && !isNaN(val));
        
        improvementSummary.recentAvgCycleTime = recentCycleTimes.length > 0 
          ? recentCycleTimes.reduce((sum, val) => sum + val, 0) / recentCycleTimes.length 
          : 0;
        
        // Calculate previous avg cycle time
        const previousCycleTimes = previousRecords
          .map(r => r.cycleTime || r.total_cycle_time_days)
          .filter(val => val && !isNaN(val));
        
        improvementSummary.previousAvgCycleTime = previousCycleTimes.length > 0 
          ? previousCycleTimes.reduce((sum, val) => sum + val, 0) / previousCycleTimes.length 
          : 0;
        
        // Calculate changes
        if (improvementSummary.previousRFT > 0) {
          improvementSummary.rftChange = ((improvementSummary.recentRFT - improvementSummary.previousRFT) / 
                                           improvementSummary.previousRFT) * 100;
        }
        
        if (improvementSummary.previousAvgCycleTime > 0) {
          improvementSummary.cycleTimeChange = ((improvementSummary.recentAvgCycleTime - improvementSummary.previousAvgCycleTime) / 
                                                 improvementSummary.previousAvgCycleTime) * 100;
        }
        
        this.transformedData.overview.improvementSummary = improvementSummary;
      }
      
      // Set overview data
      this.transformedData.overview = {
        ...this.transformedData.overview,
        totalRecords: records.length,
        overallRFTRate,
        avgCycleTime,
        monthlyMetrics,
        topIssues,
        rftPerformance: [
          { name: 'Pass', value: records.filter(r => !r.hasErrors).length },
          { name: 'Fail', value: records.filter(r => r.hasErrors).length }
        ]
      };
      
      console.log('Overview data transformation complete');
    } catch (error) {
      console.error('Error transforming overview data:', error);
    }
  }

  /**
   * Transform data for the Internal RFT tab
   */
  transformInternalRFTData() {
    try {
      const records = this.rawRecords;
      if (!records || records.length === 0) return;
      
      // Filter for internal records
      const internalRecords = records.filter(r => 
        r.source === 'Process' || r.source === 'Internal');
      
      if (internalRecords.length === 0) {
        console.warn('No internal records found for Internal RFT tab');
        return;
      }
      
      // Calculate internal RFT
      const internalRFT = this.calculateRFTRate(internalRecords);
      
      // Group internal records by month
      const monthlyGroups = this.groupRecordsByMonth(internalRecords);
      
      // Calculate monthly internal RFT rates
      const monthlyRFT = Object.entries(monthlyGroups).map(([month, monthRecords]) => ({
        month,
        rftRate: this.calculateRFTRate(monthRecords),
        recordCount: monthRecords.length
      }));
      
      // Get internal errors for Pareto analysis
      const internalErrorsPareto = calculateParetoData(
        this.analyzeErrorTypes(internalRecords.filter(r => r.hasErrors), 10)
          .map(item => ({ name: item.name, value: item.count }))
      );
      
      // Compare Assembly vs Packaging
      const assemblyRecords = internalRecords.filter(r => 
        r.assembly_start && r.assembly_finish);
      
      const packagingRecords = internalRecords.filter(r => 
        r.packaging_start && r.packaging_finish);
      
      const processComparison = {
        assembly: {
          recordCount: assemblyRecords.length,
          rftRate: this.calculateRFTRate(assemblyRecords),
          avgCycleTime: 0
        },
        packaging: {
          recordCount: packagingRecords.length,
          rftRate: this.calculateRFTRate(packagingRecords),
          avgCycleTime: 0
        }
      };
      
      // Calculate assembly cycle time
      const assemblyCycleTimes = assemblyRecords
        .map(r => r.assembly_cycle_time)
        .filter(val => val && !isNaN(val));
      
      if (assemblyCycleTimes.length > 0) {
        processComparison.assembly.avgCycleTime = assemblyCycleTimes.reduce((sum, val) => sum + val, 0) / 
                                                  assemblyCycleTimes.length;
      }
      
      // Calculate packaging cycle time
      const packagingCycleTimes = packagingRecords.map(r => {
        if (r.packaging_start && r.packaging_finish) {
          const start = new Date(r.packaging_start);
          const finish = new Date(r.packaging_finish);
          if (!isNaN(start.getTime()) && !isNaN(finish.getTime())) {
            // Return duration in days
            return (finish - start) / (1000 * 60 * 60 * 24);
          }
        }
        return null;
      }).filter(val => val !== null);
      
      if (packagingCycleTimes.length > 0) {
        processComparison.packaging.avgCycleTime = packagingCycleTimes.reduce((sum, val) => sum + val, 0) / 
                                                  packagingCycleTimes.length;
      }
      
      // Identify problematic lots
      const problematicLots = internalRecords
        .filter(r => r.hasErrors && r.errorCount > 1)
        .map(r => ({
          batchId: r.batchId,
          errorCount: r.errorCount,
          date: r.assembly_start,
          errorTypes: r.errorTypes
        }))
        .sort((a, b) => b.errorCount - a.errorCount)
        .slice(0, 5);
      
      // Set internal RFT data
      this.transformedData.internalRFT = {
        recordCount: internalRecords.length,
        internalRFT,
        monthlyRFT,
        errorPareto: internalErrorsPareto,
        processComparison,
        problematicLots
      };
      
      console.log('Internal RFT data transformation complete');
    } catch (error) {
      console.error('Error transforming internal RFT data:', error);
    }
  }

  /**
   * Transform data for the External RFT tab
   */
  transformExternalRFTData() {
    try {
      const records = this.rawRecords;
      if (!records || records.length === 0) return;
      
      // Filter for external records
      const externalRecords = records.filter(r => r.source === 'External');
      
      if (externalRecords.length === 0) {
        console.warn('No external records found for External RFT tab');
        return;
      }
      
      // Calculate external RFT
      const externalRFT = this.calculateRFTRate(externalRecords);
      
      // Filter for internal records for comparison
      const internalRecords = records.filter(r => 
        r.source === 'Process' || r.source === 'Internal');
      
      // Group records by month
      const externalMonthlyGroups = this.groupRecordsByMonth(externalRecords);
      const internalMonthlyGroups = this.groupRecordsByMonth(internalRecords);
      
      // Create comparative monthly analysis
      const allMonths = new Set([
        ...Object.keys(externalMonthlyGroups),
        ...Object.keys(internalMonthlyGroups)
      ]);
      
      const monthlyComparison = Array.from(allMonths).sort().map(month => {
        const externalMonth = externalMonthlyGroups[month] || [];
        const internalMonth = internalMonthlyGroups[month] || [];
        
        return {
          month,
          externalRFT: this.calculateRFTRate(externalMonth),
          internalRFT: this.calculateRFTRate(internalMonth),
          externalCount: externalMonth.length,
          internalCount: internalMonth.length
        };
      });
      
      // Get external errors for analysis
      const externalTopIssues = this.analyzeErrorTypes(
        externalRecords.filter(r => r.hasErrors), 
        5
      );
      
      // Impact analysis between internal and external performance
      const impactAnalysis = {
        correlation: 0,
        lagTime: 0, // in months
        observations: []
      };
      
      // Calculate correlation between internal and external RFT
      // Simple lag correlation analysis - find the lag with highest correlation
      const maxLag = 3; // Check up to 3 months lag
      let bestCorrelation = 0;
      let bestLag = 0;
      
      for (let lag = 0; lag <= maxLag; lag++) {
        const pairs = [];
        
        monthlyComparison.forEach((item, index) => {
          if (index >= lag) {
            const internalMonth = monthlyComparison[index - lag];
            if (internalMonth && item.externalRFT > 0 && internalMonth.internalRFT > 0) {
              pairs.push({
                internal: internalMonth.internalRFT,
                external: item.externalRFT
              });
            }
          }
        });
        
        if (pairs.length >= 3) { // Need at least 3 data points
          // Calculate correlation
          const internalValues = pairs.map(p => p.internal);
          const externalValues = pairs.map(p => p.external);
          
          const internalMean = internalValues.reduce((sum, val) => sum + val, 0) / internalValues.length;
          const externalMean = externalValues.reduce((sum, val) => sum + val, 0) / externalValues.length;
          
          let numerator = 0;
          let denomInternalSum = 0;
          let denomExternalSum = 0;
          
          for (let i = 0; i < pairs.length; i++) {
            const internalDiff = internalValues[i] - internalMean;
            const externalDiff = externalValues[i] - externalMean;
            
            numerator += internalDiff * externalDiff;
            denomInternalSum += internalDiff * internalDiff;
            denomExternalSum += externalDiff * externalDiff;
          }
          
          const denominator = Math.sqrt(denomInternalSum * denomExternalSum);
          const correlation = denominator === 0 ? 0 : numerator / denominator;
          
          if (Math.abs(correlation) > Math.abs(bestCorrelation)) {
            bestCorrelation = correlation;
            bestLag = lag;
          }
        }
      }
      
      impactAnalysis.correlation = bestCorrelation;
      impactAnalysis.lagTime = bestLag;
      
      // Add observations based on analysis
      if (bestCorrelation > 0.7) {
        impactAnalysis.observations.push(
          `Strong positive correlation (${bestCorrelation.toFixed(2)}) between internal and external RFT with a ${bestLag} month lag.`
        );
      } else if (bestCorrelation > 0.4) {
        impactAnalysis.observations.push(
          `Moderate correlation (${bestCorrelation.toFixed(2)}) between internal and external RFT with a ${bestLag} month lag.`
        );
      } else if (bestCorrelation > 0) {
        impactAnalysis.observations.push(
          `Weak correlation (${bestCorrelation.toFixed(2)}) between internal and external RFT with a ${bestLag} month lag.`
        );
      } else {
        impactAnalysis.observations.push(
          `No positive correlation found between internal and external RFT.`
        );
      }
      
      // Set external RFT data
      this.transformedData.externalRFT = {
        recordCount: externalRecords.length,
        externalRFT,
        internalRFT: this.calculateRFTRate(internalRecords),
        monthlyComparison,
        topIssues: externalTopIssues,
        impactAnalysis
      };
      
      console.log('External RFT data transformation complete');
    } catch (error) {
      console.error('Error transforming external RFT data:', error);
    }
  }

  /**
   * Transform data for the Process Metrics tab
   */
  transformProcessMetricsData() {
    try {
      const records = this.rawRecords;
      if (!records || records.length === 0) return;
      
      // Get records with process flow dates
      const processRecords = records.filter(r => 
        r.date_pci_l_a_br_review_date || 
        r.date_nn_l_a_br_review_date || 
        r.date_pci_pack_review_date || 
        r.date_nn_pack_review_date
      );
      
      if (processRecords.length === 0) {
        console.warn('No records with process flow dates found for Process Metrics tab');
        return;
      }
      
      // Calculate process flow metrics
      const processFlowMetrics = processRecords.map(record => {
        const flow = {
          batchId: record.batchId,
          steps: []
        };
        
        // Map sequential dates in the process flow
        const dateMapping = [
          { name: 'PCI L/A BR Review', field: 'date_pci_l_a_br_review_date' },
          { name: 'NN L/A BR Review', field: 'date_nn_l_a_br_review_date' },
          { name: 'PCI Packaging Review', field: 'date_pci_pack_review_date' },
          { name: 'NN Packaging Review', field: 'date_nn_pack_review_date' },
          { name: 'Release', field: 'release' }
        ];
        
        dateMapping.forEach(step => {
          if (record[step.field]) {
            flow.steps.push({
              name: step.name,
              date: record[step.field]
            });
          }
        });
        
        return flow;
      });
      
      // Calculate time metrics
      const timeMetrics = {
        nnReviewTime: [],
        pciCorrectionTime: [],
        nnAlignmentTime: []
      };
      
      processRecords.forEach(record => {
        // NN Review Time: difference between NN L/A BR Review and PCI L/A BR Review
        if (record.date_nn_l_a_br_review_date && record.date_pci_l_a_br_review_date) {
          const nnDate = new Date(record.date_nn_l_a_br_review_date);
          const pciDate = new Date(record.date_pci_l_a_br_review_date);
          
          if (!isNaN(nnDate.getTime()) && !isNaN(pciDate.getTime())) {
            // Calculate days difference
            const daysDiff = (nnDate - pciDate) / (1000 * 60 * 60 * 24);
            if (daysDiff >= 0) { // Only include positive differences
              timeMetrics.nnReviewTime.push(daysDiff);
            }
          }
        }
        
        // PCI Correction Time: Use correction fields if available
        if (record.pci_wip_review_cycle_time && !isNaN(record.pci_wip_review_cycle_time)) {
          timeMetrics.pciCorrectionTime.push(record.pci_wip_review_cycle_time);
        }
        
        // NN Alignment Time: Similar calculation for NN reviews
        if (record.nn_wip_review_cycle_time && !isNaN(record.nn_wip_review_cycle_time)) {
          timeMetrics.nnAlignmentTime.push(record.nn_wip_review_cycle_time);
        }
      });
      
      // Calculate statistics for each time metric
      const timeMetricsStats = {
        nnReviewTime: calculateStatistics(timeMetrics.nnReviewTime),
        pciCorrectionTime: calculateStatistics(timeMetrics.pciCorrectionTime),
        nnAlignmentTime: calculateStatistics(timeMetrics.nnAlignmentTime)
      };
      
      // Calculate improvement over time
      // Group by month and calculate process flow metrics for each month
      const monthlyGroups = this.groupRecordsByMonth(processRecords);
      
      const monthlyProcessMetrics = Object.entries(monthlyGroups).map(([month, monthRecords]) => {
        const monthMetrics = {
          month,
          nnReviewTime: 0,
          pciCorrectionTime: 0,
          nnAlignmentTime: 0,
          totalProcessTime: 0,
          recordCount: monthRecords.length
        };
        
        // Calculate average metrics for this month
        const nnReviewTimes = [];
        const pciCorrectionTimes = [];
        const nnAlignmentTimes = [];
        const totalProcessTimes = [];
        
        monthRecords.forEach(record => {
          // NN Review Time
          if (record.date_nn_l_a_br_review_date && record.date_pci_l_a_br_review_date) {
            const nnDate = new Date(record.date_nn_l_a_br_review_date);
            const pciDate = new Date(record.date_pci_l_a_br_review_date);
            
            if (!isNaN(nnDate.getTime()) && !isNaN(pciDate.getTime())) {
              const daysDiff = (nnDate - pciDate) / (1000 * 60 * 60 * 24);
              if (daysDiff >= 0) {
                nnReviewTimes.push(daysDiff);
              }
            }
          }
          
          // PCI Correction Time
          if (record.pci_wip_review_cycle_time && !isNaN(record.pci_wip_review_cycle_time)) {
            pciCorrectionTimes.push(record.pci_wip_review_cycle_time);
          }
          
          // NN Alignment Time
          if (record.nn_wip_review_cycle_time && !isNaN(record.nn_wip_review_cycle_time)) {
            nnAlignmentTimes.push(record.nn_wip_review_cycle_time);
          }
          
          // Total Process Time (cycle time)
          if (record.cycleTime || record.total_cycle_time_days) {
            const cycleTime = record.cycleTime || record.total_cycle_time_days;
            if (!isNaN(cycleTime)) {
              totalProcessTimes.push(cycleTime);
            }
          }
        });
        
        // Calculate averages
        if (nnReviewTimes.length > 0) {
          monthMetrics.nnReviewTime = nnReviewTimes.reduce((sum, val) => sum + val, 0) / nnReviewTimes.length;
        }
        
        if (pciCorrectionTimes.length > 0) {
          monthMetrics.pciCorrectionTime = pciCorrectionTimes.reduce((sum, val) => sum + val, 0) / pciCorrectionTimes.length;
        }
        
        if (nnAlignmentTimes.length > 0) {
          monthMetrics.nnAlignmentTime = nnAlignmentTimes.reduce((sum, val) => sum + val, 0) / nnAlignmentTimes.length;
        }
        
        if (totalProcessTimes.length > 0) {
          monthMetrics.totalProcessTime = totalProcessTimes.reduce((sum, val) => sum + val, 0) / totalProcessTimes.length;
        }
        
        return monthMetrics;
      });
      
      // Set process metrics data
      this.transformedData.processMetrics = {
        recordCount: processRecords.length,
        processFlowMetrics,
        timeMetricsStats,
        monthlyProcessMetrics
      };
      
      console.log('Process Metrics data transformation complete');
    } catch (error) {
      console.error('Error transforming process metrics data:', error);
    }
  }

  /**
   * Transform data for the Insights tab
   */
  transformInsightsData() {
    try {
      const records = this.rawRecords;
      if (!records || records.length === 0) return;
      
      // Correlation Analysis
      const correlations = {};
      
      // Extract data for correlation
      const dataPoints = records.map(record => {
        const point = {
          batchId: record.batchId,
          hasErrors: record.hasErrors ? 1 : 0,
          errorCount: record.errorCount || 0
        };
        
        // Add process metrics if available
        if (record.cycleTime || record.total_cycle_time_days) {
          point.cycleTime = record.cycleTime || record.total_cycle_time_days;
        }
        
        if (record.assembly_cycle_time) {
          point.assemblyCycleTime = record.assembly_cycle_time;
        }
        
        // Calculate packaging duration if available
        if (record.packaging_start && record.packaging_finish) {
          const start = new Date(record.packaging_start);
          const finish = new Date(record.packaging_finish);
          
          if (!isNaN(start.getTime()) && !isNaN(finish.getTime())) {
            point.packagingDuration = (finish - start) / (1000 * 60 * 60 * 24);
          }
        }
        
        return point;
      }).filter(point => 
        // Filter points that have at least cycle time
        point.cycleTime !== undefined
      );
      
      if (dataPoints.length > 10) { // Need sufficient data for correlation
        // Correlate cycle time with error rate
        const cycleTimeValues = dataPoints.map(p => p.cycleTime);
        const hasErrorsValues = dataPoints.map(p => p.hasErrors);
        
        // Calculate correlation
        const ctMean = cycleTimeValues.reduce((sum, val) => sum + val, 0) / cycleTimeValues.length;
        const heMean = hasErrorsValues.reduce((sum, val) => sum + val, 0) / hasErrorsValues.length;
        
        let numerator = 0;
        let denomCtSum = 0;
        let denomHeSum = 0;
        
        for (let i = 0; i < dataPoints.length; i++) {
          const ctDiff = cycleTimeValues[i] - ctMean;
          const heDiff = hasErrorsValues[i] - heMean;
          
          numerator += ctDiff * heDiff;
          denomCtSum += ctDiff * ctDiff;
          denomHeSum += heDiff * heDiff;
        }
        
        const denominator = Math.sqrt(denomCtSum * denomHeSum);
        correlations.cycleTimeErrorRate = denominator === 0 ? 0 : numerator / denominator;
        
        // Add more correlations as needed
        // ...
      }
      
      // Bottleneck Identification
      const bottleneckAnalysis = {
        stages: [],
        bottleneck: '',
        outliers: []
      };
      
      // Define process stages to analyze
      const processStages = [
        {
          name: 'Assembly',
          durationField: 'assembly_cycle_time'
        },
        {
          name: 'PCI Review',
          durationField: 'pci_wip_review_cycle_time'
        },
        {
          name: 'NN Review',
          durationField: 'nn_wip_review_cycle_time'
        },
        {
          name: 'Packaging',
          // Calculate from packaging_start and packaging_finish
          calculateDuration: (record) => {
            if (record.packaging_start && record.packaging_finish) {
              const start = new Date(record.packaging_start);
              const finish = new Date(record.packaging_finish);
              
              if (!isNaN(start.getTime()) && !isNaN(finish.getTime())) {
                return (finish - start) / (1000 * 60 * 60 * 24);
              }
            }
            return null;
          }
        }
      ];
      
      // Calculate statistics for each stage
      processStages.forEach(stage => {
        let durations = [];
        
        records.forEach(record => {
          let duration = null;
          
          if (stage.durationField && record[stage.durationField]) {
            duration = record[stage.durationField];
          } else if (stage.calculateDuration) {
            duration = stage.calculateDuration(record);
          }
          
          if (duration !== null && !isNaN(duration)) {
            durations.push({
              batchId: record.batchId,
              duration
            });
          }
        });
        
        if (durations.length > 0) {
          // Calculate statistics
          const durationValues = durations.map(d => d.duration);
          const stats = calculateStatistics(durationValues);
          
          // Find outliers (≥2 standard deviations)
          const outlierThreshold = stats.mean + 2 * stats.standardDeviation;
          const stageOutliers = durations
            .filter(d => d.duration >= outlierThreshold)
            .map(d => ({
              batchId: d.batchId,
              stage: stage.name,
              duration: d.duration,
              threshold: outlierThreshold
            }));
          
          bottleneckAnalysis.stages.push({
            name: stage.name,
            count: durations.length,
            avgDuration: stats.mean,
            medianDuration: stats.median,
            minDuration: stats.min,
            maxDuration: stats.max,
            stdDev: stats.standardDeviation
          });
          
          // Add outliers to the overall list
          bottleneckAnalysis.outliers.push(...stageOutliers);
        }
      });
      
      // Sort stages by average duration to find bottleneck
      bottleneckAnalysis.stages.sort((a, b) => b.avgDuration - a.avgDuration);
      
      if (bottleneckAnalysis.stages.length > 0) {
        bottleneckAnalysis.bottleneck = bottleneckAnalysis.stages[0].name;
      }
      
      // Sort outliers by duration descending
      bottleneckAnalysis.outliers.sort((a, b) => b.duration - a.duration);
      
      // Pattern Recognition for recurring issues
      const patternAnalysis = {
        seasonalTrends: [],
        recurringIssues: []
      };
      
      // Group errors by month to identify seasonal trends
      const monthlyErrorGroups = this.groupRecordsByMonth(
        records.filter(r => r.hasErrors),
        'assembly_start'
      );
      
      const monthlyErrorCounts = Object.entries(monthlyErrorGroups).map(([month, monthRecords]) => ({
        month,
        errorCount: monthRecords.length,
        totalCount: (this.groupRecordsByMonth(records, 'assembly_start')[month] || []).length
      })).filter(item => item.totalCount > 0);
      
      // Identify months with higher error rates
      const avgErrorRate = monthlyErrorCounts.reduce((sum, item) => 
        sum + (item.errorCount / item.totalCount), 0) / monthlyErrorCounts.length;
      
      patternAnalysis.seasonalTrends = monthlyErrorCounts
        .map(item => ({
          month: item.month,
          errorRate: (item.errorCount / item.totalCount) * 100,
          isHigh: (item.errorCount / item.totalCount) > (avgErrorRate * 1.2) // 20% above average
        }))
        .filter(item => item.isHigh)
        .sort((a, b) => b.errorRate - a.errorRate);
      
      // Find recurring issues by analyzing error types
      const allErrorTypes = [];
      
      records.filter(r => r.hasErrors && r.errorTypes).forEach(record => {
        // Handle errorTypes as either array or comma-separated string
        let errorTypes = record.errorTypes;
        if (typeof errorTypes === 'string') {
          errorTypes = errorTypes.split(',').map(e => e.trim());
        }
        
        if (Array.isArray(errorTypes)) {
          errorTypes.forEach(type => {
            if (!type) return;
            allErrorTypes.push({
              type,
              batchId: record.batchId,
              date: record.assembly_start
            });
          });
        }
      });
      
      // Group by error type
      const groupedErrors = groupBy(allErrorTypes, 'type');
      
      // Find types that appear frequently
      Object.entries(groupedErrors).forEach(([type, occurrences]) => {
        if (occurrences.length >= 3) { // At least 3 occurrences to be considered recurring
          patternAnalysis.recurringIssues.push({
            type,
            occurrences: occurrences.length,
            batches: occurrences.map(o => o.batchId),
            firstSeen: occurrences.map(o => o.date).sort()[0],
            lastSeen: occurrences.map(o => o.date).sort().pop()
          });
        }
      });
      
      // Sort by number of occurrences
      patternAnalysis.recurringIssues.sort((a, b) => b.occurrences - a.occurrences);
      
      // Generate recommendations based on insights
      const recommendations = [];
      
      // Recommendation based on bottleneck
      if (bottleneckAnalysis.bottleneck) {
        recommendations.push({
          area: 'Process Optimization',
          recommendation: `Focus on optimizing the ${bottleneckAnalysis.bottleneck} stage which has the longest average duration (${bottleneckAnalysis.stages[0].avgDuration.toFixed(1)} days).`
        });
      }
      
      // Recommendation based on correlation analysis
      if (correlations.cycleTimeErrorRate && Math.abs(correlations.cycleTimeErrorRate) > 0.4) {
        const direction = correlations.cycleTimeErrorRate > 0 ? 'positive' : 'negative';
        recommendations.push({
          area: 'Quality Improvement',
          recommendation: `There is a ${direction} correlation (${correlations.cycleTimeErrorRate.toFixed(2)}) between cycle time and error rate. ${
            direction === 'positive' ? 
            'Consider reviewing quality control for longer cycle time batches.' :
            'Faster processing may be associated with more errors, suggesting a need for balancing speed and quality.'
          }`
        });
      }
      
      // Recommendation based on recurring issues
      if (patternAnalysis.recurringIssues.length > 0) {
        const topIssue = patternAnalysis.recurringIssues[0];
        recommendations.push({
          area: 'Error Reduction',
          recommendation: `Prioritize addressing "${topIssue.type}" errors which have occurred ${topIssue.occurrences} times across multiple batches.`
        });
      }
      
      // Recommendation based on seasonal trends
      if (patternAnalysis.seasonalTrends.length > 0) {
        const highMonths = patternAnalysis.seasonalTrends
          .slice(0, Math.min(2, patternAnalysis.seasonalTrends.length))
          .map(m => m.month)
          .join(', ');
        
        recommendations.push({
          area: 'Resource Planning',
          recommendation: `Consider additional quality checks during ${highMonths} which show higher than average error rates.`
        });
      }
      
      // Set insights data
      this.transformedData.insights = {
        correlations,
        bottleneckAnalysis,
        patternAnalysis,
        recommendations
      };
      
      console.log('Insights data transformation complete');
    } catch (error) {
      console.error('Error transforming insights data:', error);
    }
  }

  /**
   * Transform data for the Deviations/Events tab (placeholder)
   */
  transformDeviationsData() {
    // Placeholder for future implementation
    this.transformedData.deviations = {
      info: "This tab is a placeholder for future implementation of Deviations/Events tracking.",
      plannedFunctionality: [
        "Event timeline visualization",
        "Deviation severity tracking",
        "CAPA management integration",
        "Compliance impact assessment"
      ],
      expectedDataSources: [
        "Deviation management system",
        "Quality event database",
        "Regulatory submission records"
      ]
    };
  }

  /**
   * Transform data for the G7 Performance Qualifications tab (placeholder)
   */
  transformG7PerformanceData() {
    // Placeholder for future implementation
    this.transformedData.g7Performance = {
      info: "This tab is a placeholder for future implementation of G7 Performance Qualifications tracking.",
      plannedFunctionality: [
        "Qualification status tracking",
        "Performance trending",
        "Validation lifecycle management",
        "Equipment efficiency metrics"
      ],
      expectedDataSources: [
        "Equipment qualification records",
        "Engineering maintenance system",
        "Performance qualification protocols"
      ]
    };
  }
}

export default DataTransformer; 