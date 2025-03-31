import React, { useState } from 'react';
import { Maximize, Minimize, X, Settings, Refresh } from 'lucide-react';

const DashboardGrid = ({ 
  children, 
  containerClassName = '', 
  responsive = true,
  editable = false,
  onLayoutChange = null,
  onRefresh = null
}) => {
  // State for tracking maximized widget
  const [maximizedWidget, setMaximizedWidget] = useState(null);
  
  // Generate unique IDs for children if they don't have them
  const childrenWithIds = React.Children.map(children, (child, index) => {
    return React.cloneElement(child, {
      id: child.props.id || `widget-${index}`,
      onMaximize: (id) => handleMaximize(id),
      onClose: editable ? (id) => handleClose(id) : undefined,
      isMaximized: maximizedWidget === (child.props.id || `widget-${index}`),
      onRefresh: onRefresh
    });
  });
  
  // Handle widget maximize/minimize
  const handleMaximize = (id) => {
    setMaximizedWidget(maximizedWidget === id ? null : id);
  };
  
  // Handle widget close (when editable)
  const handleClose = (id) => {
    // Implementation would depend on how you're managing widgets state
    if (onLayoutChange) {
      // Example of how this might work - filter out the closed widget
      const remainingChildren = React.Children.toArray(children)
        .filter(child => (child.props.id || null) !== id);
      
      onLayoutChange(remainingChildren);
    }
  };
  
  // Apply flex-based responsive layout or show only maximized widget
  if (maximizedWidget) {
    // Show only the maximized widget
    const maximizedContent = React.Children.toArray(childrenWithIds)
      .find(child => child.props.id === maximizedWidget);
    
    return (
      <div className={`w-full h-full ${containerClassName}`}>
        <div className="absolute top-4 right-4 z-10">
          <button 
            className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setMaximizedWidget(null)}
            title="Minimize"
          >
            <Minimize size={16} />
          </button>
        </div>
        <div className="w-full h-full">
          {maximizedContent}
        </div>
      </div>
    );
  }
  
  // Return responsive grid layout
  return (
    <div className={`w-full ${containerClassName}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {childrenWithIds}
      </div>
    </div>
  );
};

// Individual dashboard widget component
const DashboardWidget = ({ 
  id,
  title,
  children,
  size = 'medium', // small, medium, large
  isMaximized = false,
  onMaximize,
  onClose,
  onRefresh,
  actionButtons = [],
  className = '',
  variant = 'default', // default, bordered, elevated, gradient
  hideHeader = false
}) => {
  // Determine the grid column span based on size for responsive layouts
  const getSizeClass = () => {
    if (isMaximized) return 'col-span-full';
    
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'large':
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 'medium':
      default:
        return 'col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1';
    }
  };
  
  // Get the appropriate styling based on variant
  const getVariantClass = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
      case 'elevated':
        return 'shadow-md bg-white dark:bg-gray-800';
      case 'gradient':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700';
      default:
        return 'bg-white dark:bg-gray-800 shadow-sm';
    }
  };
  
  return (
    <div className={`${getSizeClass()} relative rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md ${getVariantClass()} ${className}`}>
      {/* Widget header */}
      {!hideHeader && (
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-medium text-gray-800 dark:text-white text-sm">{title}</h3>
          
          <div className="flex items-center space-x-1">
            {/* Optional refresh button */}
            {onRefresh && (
              <button 
                onClick={() => onRefresh(id)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                title="Refresh"
              >
                <Refresh size={14} />
              </button>
            )}
            
            {/* Custom action buttons */}
            {actionButtons.map((button, index) => (
              <button 
                key={index}
                onClick={button.onClick}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                title={button.title}
              >
                {button.icon}
              </button>
            ))}
            
            {/* Maximize/restore button */}
            {onMaximize && (
              <button 
                onClick={() => onMaximize(id)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                title={isMaximized ? "Minimize" : "Maximize"}
              >
                <Maximize size={14} />
              </button>
            )}
            
            {/* Close button when widget is editable */}
            {onClose && (
              <button 
                onClick={() => onClose(id)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                title="Close"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Widget content */}
      <div className={`${hideHeader ? 'p-0' : 'p-4'} ${isMaximized ? 'h-[calc(100vh-9rem)]' : ''} overflow-auto`}>
        {children}
      </div>
    </div>
  );
};

DashboardGrid.Widget = DashboardWidget;

export default DashboardGrid;
