import React, { useState, useEffect } from 'react';
import { useDataContext } from './DataContext.js';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Search, Filter, Download, ChevronDown, ChevronUp, ArrowLeft, ArrowRight } from 'lucide-react';

const LotAnalytics = () => {
  const { data, isLoading } = useDataContext();
  
  // State for lot data
  const [lotList, setLotList] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('batchId');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lotsPerPage] = useState(10);
  
  // Process lots when data changes
  useEffect(() => {
    if (data?.lotData) {
      const lotsArray = Object.entries(data.lotData).map(([batchId, lot]) => ({
        batchId,
        ...lot,
        // Add some calculated fields
        rftRate: lot.hasErrors ? 
          (lot.recordCount ? (1 - (lot.errorCount / lot.recordCount)) * 100 : 0) : 
          100,
        status: lot.released ? 'Released' : 'In Process',
        department: lot.department || 'Production' // Default department if not specified
      }));
      
      setLotList(lotsArray);
      applyFilters(lotsArray);
    }
  }, [data]);
  
  // Apply filters and sorting
  const applyFilters = (lots = lotList) => {
    // First apply search
    let filtered = lots;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lot => 
        lot.batchId.toLowerCase().includes(query) ||
        (lot.department && lot.department.toLowerCase().includes(query))
      );
    }
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(lot => 
        lot.department && lot.department.toLowerCase() === departmentFilter.toLowerCase()
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lot => 
        lot.status && lot.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'batchId') {
        comparison = a.batchId.localeCompare(b.batchId);
      } else if (sortField === 'department') {
        comparison = (a.department || '').localeCompare(b.department || '');
      } else if (sortField === 'rftRate') {
        comparison = (a.rftRate || 0) - (b.rftRate || 0);
      } else if (sortField === 'cycleTime') {
        comparison = (a.cycleTime || 0) - (b.cycleTime || 0);
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredLots(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Effect to apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, departmentFilter, statusFilter, sortField, sortDirection]);
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and reset direction
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get current lots for pagination
  const indexOfLastLot = currentPage * lotsPerPage;
  const indexOfFirstLot = indexOfLastLot - lotsPerPage;
  const currentLots = filteredLots.slice(indexOfFirstLot, indexOfLastLot);
  const totalPages = Math.ceil(filteredLots.length / lotsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Select a lot for detailed view
  const handleSelectLot = (lot) => {
    setSelectedLot(lot);
  };
  
  // Back to list view
  const handleBackToList = () => {
    setSelectedLot(null);
  };
  
  // Export lot data as CSV
  const handleExportData = () => {
    const headers = ['Batch ID', 'Department', 'Status', 'RFT Rate', 'Cycle Time', 'Error Count'];
    
    const csvData = filteredLots.map(lot => [
      lot.batchId,
      lot.department || 'N/A',
      lot.status || 'N/A',
      (lot.rftRate || 0).toFixed(1) + '%',
      (lot.cycleTime || 0).toFixed(1) + ' days',
      lot.errorCount || '0'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lot_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Lot detail card component
  const LotDetailCard = ({ lot }) => {
    if (!lot) return null;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <button 
              className="text-blue-600 hover:text-blue-800 flex items-center mb-2"
              onClick={handleBackToList}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Lot List
            </button>
            <h2 className="text-2xl font-bold">{lot.batchId}</h2>
          </div>
          
          <div className="flex space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              lot.hasErrors ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {lot.hasErrors ? 'Failed' : 'Passed'}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {lot.status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">Department</h3>
            <p className="text-lg font-semibold">{lot.department || 'Production'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">RFT Rate</h3>
            <p className="text-lg font-semibold">{lot.rftRate.toFixed(1)}%</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">Cycle Time</h3>
            <p className="text-lg font-semibold">{lot.cycleTime ? `${lot.cycleTime.toFixed(1)} days` : 'N/A'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-3">Process Timeline</h3>
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">1</div>
                  <span>Bulk Receipt</span>
                </div>
                <span className="text-sm text-gray-500">{lot.bulkReceiptDate ? new Date(lot.bulkReceiptDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">2</div>
                  <span>Assembly</span>
                </div>
                <span className="text-sm text-gray-500">{lot.assemblyTime ? `${lot.assemblyTime.toFixed(1)} days` : 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">3</div>
                  <span>PCI Review</span>
                </div>
                <span className="text-sm text-gray-500">{lot.pciReviewTime ? `${lot.pciReviewTime.toFixed(1)} days` : 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">4</div>
                  <span>NN Review</span>
                </div>
                <span className="text-sm text-gray-500">{lot.nnReviewTime ? `${lot.nnReviewTime.toFixed(1)} days` : 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">5</div>
                  <span>Packaging</span>
                </div>
                <span className="text-sm text-gray-500">
                  {lot.packagingStart && lot.packagingFinish ? 
                    `${((new Date(lot.packagingFinish) - new Date(lot.packagingStart)) / (1000 * 60 * 60 * 24)).toFixed(1)} days` : 
                    'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">6</div>
                  <span>Release</span>
                </div>
                <span className="text-sm text-gray-500">{lot.releaseDate ? new Date(lot.releaseDate).toLocaleDateString() : 'Pending'}</span>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-3">Quality Information</h3>
            
            <div className="mb-4">
              <h4 className="text-sm text-gray-500 mb-1">Record Count</h4>
              <p className="font-medium">{lot.recordCount || 'N/A'}</p>
            </div>
            
            {lot.hasErrors && (
              <>
                <div className="mb-4">
                  <h4 className="text-sm text-gray-500 mb-1">Error Count</h4>
                  <p className="font-medium text-red-600">{lot.errorCount || 0}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm text-gray-500 mb-1">Error Types</h4>
                  <div className="space-y-1 mt-2">
                    {lot.errorTypes ? (
                      (Array.isArray(lot.errorTypes) ? lot.errorTypes : String(lot.errorTypes).split(',')).map((type, i) => (
                        <div key={i} className="px-2 py-1 bg-red-50 text-red-800 text-sm rounded">
                          {type.trim()}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No detailed error information</p>
                    )}
                  </div>
                </div>
              </>
            )}
            
            <div className="mt-4">
              <h4 className="text-sm text-gray-500 mb-2">RFT Comparison</h4>
              <div className="h-10 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full" 
                  style={{ 
                    width: `${lot.rftRate}%`,
                    backgroundColor: lot.rftRate > 90 ? '#00843d' : lot.rftRate > 80 ? '#ffc72c' : '#c8102e'
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>0%</span>
                <span>Average: {data?.overview?.overallRFTRate || 90}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium mb-3">Recommendations</h3>
          
          {lot.hasErrors ? (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800">Review Documentation Process</h4>
                <p className="text-sm text-blue-700">Implement additional verification steps for {lot.department || 'department'} documentation to reduce similar errors.</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800">Error Trend Analysis</h4>
                <p className="text-sm text-blue-700">Perform detailed analysis to identify if this error pattern is recurring across multiple lots.</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-green-50 rounded-md">
              <h4 className="font-medium text-green-800">Process Documentation</h4>
              <p className="text-sm text-green-700">Document the successful practices used in this lot as part of standard operating procedures.</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Filter controls
  const FilterControls = () => {
    return (
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-2 md:mb-0">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by Batch ID" 
                className="border rounded-md px-3 py-2 pl-8 text-sm w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
            </div>
            
            <select 
              className="border rounded-md px-3 py-2 text-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="production">Production</option>
              <option value="quality">Quality</option>
              <option value="packaging">Packaging</option>
            </select>
            
            <select 
              className="border rounded-md px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="released">Released</option>
              <option value="in process">In Process</option>
            </select>
          </div>
          
          <button 
            className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm flex items-center justify-center"
            onClick={handleExportData}
          >
            <Download className="w-4 h-4 mr-1" />
            Export Lot Data
          </button>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <span className="font-medium">{filteredLots.length}</span> lots found
            {searchQuery && <span> matching "<span className="font-medium">{searchQuery}</span>"</span>}
            {departmentFilter !== 'all' && <span> in <span className="font-medium">{departmentFilter}</span></span>}
            {statusFilter !== 'all' && <span> with status <span className="font-medium">{statusFilter}</span></span>}
          </div>
          
          <div className="text-sm text-gray-500">
            Sorted by: <span className="font-medium">{sortField}</span> ({sortDirection === 'asc' ? 'ascending' : 'descending'})
          </div>
        </div>
      </div>
    );
  };
  
  // Pagination controls
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstLot + 1}-{Math.min(indexOfLastLot, filteredLots.length)} of {filteredLots.length} lots
        </div>
        
        <div className="flex space-x-1">
          <button 
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1; // Show first 5 pages
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i; // Show last 5 pages
            } else {
              pageNum = currentPage - 2 + i; // Show 2 before and 2 after current
            }
            
            return (
              <button 
                key={pageNum}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === pageNum ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                }`}
                onClick={() => paginate(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };
  
  // Lots table
  const LotsTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('batchId')}
              >
                <div className="flex items-center">
                  Batch ID
                  {sortField === 'batchId' && (
                    sortDirection === 'asc' ? 
                      <ChevronUp className="w-4 h-4 ml-1" /> : 
                      <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('department')}
              >
                <div className="flex items-center">
                  Department
                  {sortField === 'department' && (
                    sortDirection === 'asc' ? 
                      <ChevronUp className="w-4 h-4 ml-1" /> : 
                      <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('rftRate')}
              >
                <div className="flex items-center">
                  RFT Status
                  {sortField === 'rftRate' && (
                    sortDirection === 'asc' ? 
                      <ChevronUp className="w-4 h-4 ml-1" /> : 
                      <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('cycleTime')}
              >
                <div className="flex items-center">
                  Cycle Time
                  {sortField === 'cycleTime' && (
                    sortDirection === 'asc' ? 
                      <ChevronUp className="w-4 h-4 ml-1" /> : 
                      <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortField === 'status' && (
                    sortDirection === 'asc' ? 
                      <ChevronUp className="w-4 h-4 ml-1" /> : 
                      <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentLots.length > 0 ? (
              currentLots.map((lot) => (
                <tr key={lot.batchId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lot.batchId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lot.department || 'Production'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${lot.hasErrors ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {lot.hasErrors ? 'Failed' : 'Passed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lot.cycleTime ? `${lot.cycleTime.toFixed(1)} days` : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {lot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleSelectLot(lot)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No lots found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Lot Analytics</h2>
        <p className="text-sm text-gray-600">Detailed analysis and tracking of individual manufacturing lots</p>
      </div>
      
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-12 flex justify-center items-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-500">Loading lot data...</span>
        </div>
      ) : (
        <>
          {selectedLot ? (
            <LotDetailCard lot={selectedLot} />
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <FilterControls />
              <LotsTable />
              <PaginationControls />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LotAnalytics;
