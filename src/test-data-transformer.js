/**
 * Test script for DataTransformer
 * 
 * This file provides a simple test harness for the DataTransformer module.
 * It creates sample data in the expected format and runs it through the transformer
 * to validate the output.
 */

import DataTransformer from './DataTransformer';

// Create sample records that reflect the expected data structure
const createSampleRecords = () => {
  const records = [];
  const startDate = new Date('2023-01-01');
  const errorTypes = [
    'Missing Signature', 
    'Incomplete Form', 
    'Documentation Error',
    'Data Entry Error',
    'Late Submission',
    'Process Deviation',
    'Calibration Issue',
    'Equipment Malfunction',
    'Material Issue'
  ];
  
  // Create 100 sample records
  for (let i = 0; i < 100; i++) {
    // Generate a date that's 1-3 days after the previous record
    const recordDate = new Date(startDate);
    recordDate.setDate(recordDate.getDate() + (i * 2) + Math.floor(Math.random() * 2));
    
    // Format dates in ISO format
    const assemblyStartDate = new Date(recordDate);
    const assemblyFinishDate = new Date(assemblyStartDate);
    assemblyFinishDate.setDate(assemblyFinishDate.getDate() + 2 + Math.floor(Math.random() * 3));
    
    const pciReviewDate = new Date(assemblyFinishDate);
    pciReviewDate.setDate(pciReviewDate.getDate() + 1 + Math.floor(Math.random() * 2));
    
    const nnReviewDate = new Date(pciReviewDate);
    nnReviewDate.setDate(nnReviewDate.getDate() + 1 + Math.floor(Math.random() * 3));
    
    const packagingStartDate = new Date(nnReviewDate);
    packagingStartDate.setDate(packagingStartDate.getDate() + 1 + Math.floor(Math.random() * 2));
    
    const packagingFinishDate = new Date(packagingStartDate);
    packagingFinishDate.setDate(packagingFinishDate.getDate() + 2 + Math.floor(Math.random() * 3));
    
    const releaseDate = new Date(packagingFinishDate);
    releaseDate.setDate(releaseDate.getDate() + 1 + Math.floor(Math.random() * 2));
    
    // Determine if record has errors
    const hasErrors = Math.random() < 0.15; // 15% chance of errors
    
    // Calculate total cycle time
    const cycleTime = (releaseDate - assemblyStartDate) / (1000 * 60 * 60 * 24);
    
    // Create the record
    const record = {
      batchId: `B${10000 + i}`,
      assembly_start: assemblyStartDate.toISOString().split('T')[0],
      assembly_finish: assemblyFinishDate.toISOString().split('T')[0],
      date_pci_l_a_br_review_date: pciReviewDate.toISOString().split('T')[0],
      date_nn_l_a_br_review_date: nnReviewDate.toISOString().split('T')[0],
      packaging_start: packagingStartDate.toISOString().split('T')[0],
      packaging_finish: packagingFinishDate.toISOString().split('T')[0],
      date_pci_pack_review_date: new Date(packagingFinishDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_nn_pack_review_date: new Date(packagingFinishDate.getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
      release: releaseDate.toISOString().split('T')[0],
      shipment: new Date(releaseDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hasErrors: hasErrors,
      errorCount: hasErrors ? Math.floor(Math.random() * 3) + 1 : 0,
      released: Math.random() < 0.95 ? "Yes" : "No",
      cycleTime: cycleTime.toFixed(1),
      total_cycle_time_days: cycleTime.toFixed(1),
      assembly_cycle_time: ((assemblyFinishDate - assemblyStartDate) / (1000 * 60 * 60 * 24)).toFixed(1),
      pci_wip_review_cycle_time: ((nnReviewDate - pciReviewDate) / (1000 * 60 * 60 * 24)).toFixed(1),
      nn_wip_review_cycle_time: ((packagingStartDate - nnReviewDate) / (1000 * 60 * 60 * 24)).toFixed(1),
      calendar_yr: assemblyStartDate.getFullYear().toString(),
      source: i % 5 === 0 ? "External" : (i % 2 === 0 ? "Internal" : "Process")
    };
    
    // Add error types if there are errors
    if (hasErrors) {
      // Generate 1-3 random error types
      const errorCount = record.errorCount;
      const recordErrors = [];
      
      // Ensure no duplicate error types
      const availableErrors = [...errorTypes];
      
      for (let j = 0; j < errorCount; j++) {
        if (availableErrors.length === 0) break;
        
        const errorIndex = Math.floor(Math.random() * availableErrors.length);
        recordErrors.push(availableErrors[errorIndex]);
        availableErrors.splice(errorIndex, 1);
      }
      
      record.errorTypes = recordErrors;
    }
    
    // Add supplementary fields
    record.fg_batch = `FG${record.batchId.substring(1)}`;
    record.bulk_batch = `BLK${record.batchId.substring(1)}`;
    record.strength = ["10mg", "25mg", "50mg", "100mg"][Math.floor(Math.random() * 4)];
    record.ninety_day = Math.random() < 0.1 ? "Yes" : "No";
    record.oee = (70 + Math.floor(Math.random() * 25)).toString();
    record.row_number = i + 1;
    
    records.push(record);
  }
  
  return records;
};

// Main test function
const testDataTransformer = () => {
  console.log('Creating sample records...');
  const sampleRecords = createSampleRecords();
  console.log(`Created ${sampleRecords.length} sample records`);
  
  console.log('Initializing DataTransformer...');
  const transformer = new DataTransformer();
  
  console.log('Loading sample data...');
  transformer.setRawData(sampleRecords);
  
  console.log('Transforming data...');
  const transformedData = transformer.transformData();
  
  // Display results
  console.log('Transformation complete!');
  console.log('Overview Tab Data:');
  console.log(`- Total Records: ${transformedData.overview.totalRecords}`);
  console.log(`- Overall RFT Rate: ${transformedData.overview.overallRFTRate.toFixed(2)}%`);
  console.log(`- Average Cycle Time: ${transformedData.overview.avgCycleTime.toFixed(2)} days`);
  console.log(`- Monthly Metrics: ${transformedData.overview.monthlyMetrics?.length} months`);
  console.log(`- Top Issues: ${transformedData.overview.topIssues?.map(i => i.name).join(', ')}`);
  
  console.log('\nInternal RFT Tab Data:');
  console.log(`- Internal Records: ${transformedData.internalRFT.recordCount}`);
  console.log(`- Internal RFT Rate: ${transformedData.internalRFT.internalRFT?.toFixed(2)}%`);
  console.log(`- Monthly RFT Data: ${transformedData.internalRFT.monthlyRFT?.length} months`);
  console.log(`- Process Comparison: Assembly RFT=${transformedData.internalRFT.processComparison?.assembly.rftRate?.toFixed(2)}%, Packaging RFT=${transformedData.internalRFT.processComparison?.packaging.rftRate?.toFixed(2)}%`);
  
  console.log('\nExternal RFT Tab Data:');
  console.log(`- External Records: ${transformedData.externalRFT.recordCount}`);
  console.log(`- External RFT Rate: ${transformedData.externalRFT.externalRFT?.toFixed(2)}%`);
  console.log(`- Internal vs External: Internal=${transformedData.externalRFT.internalRFT?.toFixed(2)}%, External=${transformedData.externalRFT.externalRFT?.toFixed(2)}%`);
  console.log(`- Correlation: ${transformedData.externalRFT.impactAnalysis?.correlation?.toFixed(2)} with ${transformedData.externalRFT.impactAnalysis?.lagTime} month lag`);
  
  console.log('\nProcess Metrics Tab Data:');
  console.log(`- Process Records: ${transformedData.processMetrics.recordCount}`);
  console.log(`- Process Flow Metrics: ${transformedData.processMetrics.processFlowMetrics?.length} records`);
  console.log(`- NN Review Time: Avg=${transformedData.processMetrics.timeMetricsStats?.nnReviewTime.mean?.toFixed(2)} days, Median=${transformedData.processMetrics.timeMetricsStats?.nnReviewTime.median?.toFixed(2)} days`);
  console.log(`- PCI Correction Time: Avg=${transformedData.processMetrics.timeMetricsStats?.pciCorrectionTime.mean?.toFixed(2)} days, Median=${transformedData.processMetrics.timeMetricsStats?.pciCorrectionTime.median?.toFixed(2)} days`);
  
  console.log('\nInsights Tab Data:');
  console.log(`- Bottleneck: ${transformedData.insights.bottleneckAnalysis?.bottleneck}`);
  console.log(`- Outliers: ${transformedData.insights.bottleneckAnalysis?.outliers?.length} records`);
  console.log(`- Seasonal Trends: ${transformedData.insights.patternAnalysis?.seasonalTrends?.length} months with high error rates`);
  console.log(`- Recurring Issues: ${transformedData.insights.patternAnalysis?.recurringIssues?.length} recurring issue types`);
  console.log('\nRecommendations:');
  transformedData.insights.recommendations?.forEach((rec, i) => {
    console.log(`${i+1}. ${rec.area}: ${rec.recommendation}`);
  });
  
  return transformedData;
};

// Run the test
console.log('Starting DataTransformer test...');
const result = testDataTransformer();
console.log('Test completed successfully!');

export default testDataTransformer; 