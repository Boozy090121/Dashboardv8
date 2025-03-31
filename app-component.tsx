import React from 'react';
import NovoNordiskDashboard from './novo-nordisk-dashboard.js';
import { DataProvider } from './DataContext.js';

const App = () => {
  return (
    <DataProvider>
      <NovoNordiskDashboard />
      {/* <div style={{ padding: '20px' }}>Testing DataProvider... Look at console.</div> */}
    </DataProvider>
  );
};

export default App;
