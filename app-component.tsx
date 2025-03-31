import React from 'react';
// import NovoNordiskDashboard from './novo-nordisk-dashboard'; // Temporarily comment out
import { DataProvider } from './DataContext.js';

const App = () => {
  return (
    <DataProvider>
      {/* <NovoNordiskDashboard /> */}
      {/* Temporarily render a simple div instead */}
      <div style={{ padding: '20px' }}>Testing DataProvider... Look at console.</div>
    </DataProvider>
  );
};

export default App;
