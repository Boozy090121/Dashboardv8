import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Initialize the application with React 18 syntax
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Keeping StrictMode disabled to avoid double rendering/mount effects
  <App />
); 