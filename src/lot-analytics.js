import React from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useDataContext } from './DataContext.js';

const LotAnalytics = () => {
  const { data, isLoading, error } = useDataContext();
  
  // State for lot data
  const [lotList, setLotList] = React.useState([]);
  const [filteredLots, setFilteredLots] = React.useState([]);
  const [selectedLot, setSelectedLot] = React.useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [departmentFilter, setDepartmentFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [sortField, setSortField] = React.useState('batchId');
  const [sortDirection, setSortDirection] = React.useState('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const [lotsPerPage] = React.useState(10);
  
  // Colors
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
  
  // Process lots when data changes
  React.useEffect(() => {
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
  
  // Apply filters, sorting and pagination
  const applyFilters = (lots) => {
    let result = [...lots];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(lot => 
        lot.batchId.toLowerCase().includes(query) || 
        lot.department.toLowerCase().includes(query)
      );
    }
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      result = result.filter(lot => lot.department === departmentFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(lot => lot.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      // Handle special case for date fields
      if (sortField === 'releaseDate' || sortField === 'packagingStart' || sortField === 'packagingFinish') {
        const dateA = a[sortField] ? new Date(a[sortField]) : new Date(0);
        const dateB = b[sortField] ? new Date(b[sortField]) : new Date(0);
        comparison = dateA - dateB;
      } else {
        // Standard comparison for non-date fields
        const valueA = a[sortField] || '';
        const valueB = b[sortField] || '';
        
        if (typeof valueA === 'string') {
          comparison = valueA.localeCompare(valueB);
        } else {
          comparison = valueA - valueB;
        }
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredLots(result);
    
    // Reset to first page when filters change
    setCurrentPage(1);
  };
  
  // Handle filter and sort changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    applyFilters(lotList);
  };
  
  const handleDepartmentFilterChange = (e) => {
    setDepartmentFilter(e.target.value);
    applyFilters(lotList);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    applyFilters(lotList);
  };
  
  const handleSort = (field) => {
    // If clicking the same field, toggle direction
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    applyFilters(lotList);
  };
  
  // Get current lots for pagination
  const indexOfLastLot = currentPage * lotsPerPage;
  const indexOfFirstLot = indexOfLastLot - lotsPerPage;
  const currentLots = filteredLots.slice(indexOfFirstLot, indexOfLastLot);
  const totalPages = Math.ceil(filteredLots.length / lotsPerPage);
  
  // Pagination controls
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Select a lot for detailed view
  const handleLotSelect = (lot) => {
    setSelectedLot(lot);
  };
  
  // Components
  
  // Table header with sorting
  const SortableHeader = ({ field, label }) => (
    <th 
      scope="col" 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {sortField === field && (
          <span className="ml-1">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );
  
  // Lot Table Component
  const LotsTable = () => (
    <div className="overflow-x-auto shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader field="batchId" label="Batch ID" />
            <SortableHeader field="department" label="Department" />
            <SortableHeader field="rftRate" label="RFT Rate" />
            <SortableHeader field="cycleTime" label="Cycle Time" />
            <SortableHeader field="status" label="Status" />
            <SortableHeader field="releaseDate" label="Release Date" />
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentLots.map((lot) => (
            <tr 
              key={lot.batchId} 
              className={selectedLot?.batchId === lot.batchId ? 'bg-blue-50' : ''}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {lot.batchId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {lot.department}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${lot.rftRate >= 95 ? 'bg-green-500' : lot.rftRate >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  {lot.rftRate ? lot.rftRate.toFixed(1) : 'N/A'}%
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {lot.cycleTime ? lot.cycleTime.toFixed(1) : 'N/A'} days
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  lot.status === 'Released' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {lot.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {lot.releaseDate || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  className="text-indigo-600 hover:text-indigo-900"
                  onClick={() => handleLotSelect(lot)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
          {currentLots.length === 0 && (
            <tr>
              <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                No lots found matching the current filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  
  // Pagination Component
  const Pagination = () => (
    <div className="flex items-center justify-between my-4">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-700 px-4 py-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstLot + 1}</span> to{' '}
            <span className="font-medium">{Math.min(indexOfLastLot, filteredLots.length)}</span> of{' '}
            <span className="font-medium">{filteredLots.length}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              &laquo;
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              &lsaquo;
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              
              if (totalPages <= 5) {
                // Show all pages if 5 or less
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                // At the beginning
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                // At the end
                pageNum = totalPages - 4 + i;
              } else {
                // In the middle
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                    currentPage === pageNum 
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              &rsaquo;
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              &raquo;
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
  
  // Filter Panel Component
  const FilterPanel = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            id="search"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            placeholder="Search by ID or department"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            id="department"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={departmentFilter}
            onChange={handleDepartmentFilterChange}
          >
            <option value="all">All Departments</option>
            <option value="Production">Production</option>
            <option value="Quality">Quality</option>
            <option value="Packaging">Packaging</option>
            <option value="Logistics">Logistics</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="status"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="all">All Statuses</option>
            <option value="Released">Released</option>
            <option value="In Process">In Process</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => {
            setSearchQuery('');
            setDepartmentFilter('all');
            setStatusFilter('all');
            setSortField('batchId');
            setSortDirection('asc');
            applyFilters(lotList);
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
  
  // Lot Details Component
  const LotDetails = () => {
    if (!selectedLot) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Select a lot to view details</p>
        </div>
      );
    }
    
    // Calculate days in the process
    const packagingStart = selectedLot.packagingStart ? new Date(selectedLot.packagingStart) : null;
    const releaseDate = selectedLot.releaseDate ? new Date(selectedLot.releaseDate) : null;
    const daysInProcess = packagingStart && releaseDate 
      ? Math.round((releaseDate - packagingStart) / (1000 * 60 * 60 * 24)) 
      : 'N/A';
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Lot {selectedLot.batchId}</h3>
            <p className="text-sm text-gray-500">
              {selectedLot.department} • {selectedLot.status}
            </p>
          </div>
          <div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              selectedLot.hasErrors ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {selectedLot.hasErrors ? 'Has Errors' : 'No Errors'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">RFT Rate</h4>
            <p className="text-2xl font-bold">{selectedLot.rftRate?.toFixed(1) || 'N/A'}%</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Cycle Time</h4>
            <p className="text-2xl font-bold">{selectedLot.cycleTime?.toFixed(1) || 'N/A'} days</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Records</h4>
            <p className="text-2xl font-bold">
              {selectedLot.recordCount || 0}
              {selectedLot.errorCount > 0 && 
                <span className="text-sm text-red-600 ml-2">({selectedLot.errorCount} errors)</span>
              }
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-lg font-medium mb-4">Timeline</h4>
          <div className="space-y-4">
            {selectedLot.packagingStart && (
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  1
                </div>
                <div className="ml-4">
                  <h5 className="text-sm font-medium">Packaging Start</h5>
                  <p className="text-sm text-gray-500">{selectedLot.packagingStart}</p>
                </div>
              </div>
            )}
            
            {selectedLot.packagingFinish && (
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  2
                </div>
                <div className="ml-4">
                  <h5 className="text-sm font-medium">Packaging Finish</h5>
                  <p className="text-sm text-gray-500">{selectedLot.packagingFinish}</p>
                </div>
              </div>
            )}
            
            {selectedLot.releaseDate && (
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  3
                </div>
                <div className="ml-4">
                  <h5 className="text-sm font-medium">Release Date</h5>
                  <p className="text-sm text-gray-500">{selectedLot.releaseDate}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="text-lg font-medium mb-2">Additional Information</h4>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Days in Process</dt>
              <dd className="mt-1 text-sm text-gray-900">{daysInProcess}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Quality Check</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedLot.hasErrors ? 'Failed' : 'Passed'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Responsible Team</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedLot.department}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedLot.status}</dd>
            </div>
          </dl>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 mr-3 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            onClick={() => setSelectedLot(null)}
          >
            Close
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            Download Report
          </button>
        </div>
      </div>
    );
  };
  
  // Dashboard Overview Component
  const DashboardOverview = () => {
    // Calculate statistics
    const totalLots = lotList.length;
    const completedLots = lotList.filter(lot => lot.status === 'Released').length;
    const completionRate = totalLots > 0 ? (completedLots / totalLots * 100).toFixed(1) : 'N/A';
    
    // Average RFT and cycle time
    const rftRates = lotList.map(lot => lot.rftRate).filter(rate => rate !== undefined);
    const avgRftRate = rftRates.length > 0 
      ? (rftRates.reduce((sum, rate) => sum + rate, 0) / rftRates.length).toFixed(1)
      : 'N/A';
      
    const cycleTimes = lotList.map(lot => lot.cycleTime).filter(time => time !== undefined);
    const avgCycleTime = cycleTimes.length > 0 
      ? (cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length).toFixed(1)
      : 'N/A';
    
    // Department breakdown
    const departments = {};
    lotList.forEach(lot => {
      departments[lot.department] = (departments[lot.department] || 0) + 1;
    });
    
    // Convert departments to chart data
    const departmentData = Object.entries(departments).map(([name, value]) => ({ name, value }));
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Total Lots</h4>
          <p className="text-2xl font-bold">{totalLots}</p>
          <div className="mt-4 text-sm text-gray-500">
            <span className="font-medium">{completedLots}</span> released ({completionRate}%)
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Average RFT Rate</h4>
          <p className="text-2xl font-bold">{avgRftRate}%</p>
          <div className="mt-4 text-sm text-gray-500">
            Across {rftRates.length} lots with data
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Average Cycle Time</h4>
          <p className="text-2xl font-bold">{avgCycleTime} days</p>
          <div className="mt-4 text-sm text-gray-500">
            Across {cycleTimes.length} lots with data
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Department Breakdown</h4>
          {departmentData.length > 0 ? (
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors.chartColors[index % colors.chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Lots']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-36 text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Main component content
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center py-8">
        <div className="animate-spin mx-auto mb-4 w-8 h-8 border-2 border-dashed rounded-full border-blue-500"></div>
        <p className="text-gray-600">Loading lot data...</p>
      </div>
    );
  }
  
  if (error || !data?.lotData) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center py-8">
        <div className="mx-auto mb-4 w-12 h-12 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-600 mb-2">No Lot Data</h3>
        <p className="text-gray-600">{error || "There is no lot data available in the dataset"}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Lot Analytics</h2>
        <p className="text-gray-500 text-sm">View and analyze manufacturing lot data</p>
      </div>
      
      <div className="p-4">
        <DashboardOverview />
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <FilterPanel />
            <LotsTable />
            <Pagination />
          </div>
          
          <div className="md:w-1/3">
            <LotDetails />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotAnalytics; 