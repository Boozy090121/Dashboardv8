// Fixed index.js file
// This fixes the double DataProvider wrapping issue

import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './src/App';

// Initialize the application with React 18 syntax
// App already includes DataProvider, so we don't need to wrap it here
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 