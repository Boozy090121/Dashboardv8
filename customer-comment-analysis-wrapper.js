import React from 'react';

// Define a component wrapper
const CustomerCommentAnalysisWrapper = (props) => {
  const [Component, setComponent] = React.useState(() => () => null);
  
  React.useEffect(() => {
    // Try to dynamically import the component
    const loadComponent = async () => {
      try {
        // Using dynamic import to avoid issues with static import file extensions
        const module = await import('./customer-comment-analysis.tsx');
        setComponent(() => module.default);
      } catch (error) {
        console.error('Error loading customer comment analysis component:', error);
      }
    };
    
    loadComponent();
  }, []);
  
  // Render the loaded component, passing through all props
  return <Component {...props} />;
};

export default CustomerCommentAnalysisWrapper; 