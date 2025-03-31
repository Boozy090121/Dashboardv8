/**
 * DEPRECATED - USE DataContext.js INSTEAD
 * 
 * This file exists only for backwards compatibility.
 * All components should import from DataContext.js directly.
 */
import DataContext, { DataProvider, useDataContext } from './DataContext.js';

export { DataProvider, useDataContext };
export default DataContext;
