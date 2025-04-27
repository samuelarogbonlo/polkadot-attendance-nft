import React, { createContext, useState, useContext, useEffect } from 'react';

// Scale options
export const SCALE_OPTIONS = {
  DEFAULT: 1.0,
  MEDIUM: 1.15,
  LARGE: 1.3
};

// Create context
const FontSizeContext = createContext({
  scale: SCALE_OPTIONS.DEFAULT,
  setScale: () => {},
  scaleLabel: 'Default',
});

// Custom hook to use the font size context
export const useFontSize = () => useContext(FontSizeContext);

/**
 * Font Size Provider Component
 * Handles font scaling across the application
 */
export const FontSizeProvider = ({ children }) => {
  // Get saved scale or use default
  const [scale, setScale] = useState(() => {
    const savedScale = localStorage.getItem('fontScale');
    return savedScale ? parseFloat(savedScale) : SCALE_OPTIONS.DEFAULT;
  });
  
  // Get label based on scale
  const getScaleLabel = (scaleValue) => {
    switch(scaleValue) {
      case SCALE_OPTIONS.MEDIUM:
        return 'Medium';
      case SCALE_OPTIONS.LARGE:
        return 'Large';
      default:
        return 'Default';
    }
  };
  
  // Save scale to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('fontScale', scale.toString());
  }, [scale]);
  
  return (
    <FontSizeContext.Provider 
      value={{ 
        scale, 
        setScale, 
        scaleLabel: getScaleLabel(scale) 
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
};

export default FontSizeContext; 