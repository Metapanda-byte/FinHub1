import React from 'react';

interface FinHubLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FinHubLogo: React.FC<FinHubLogoProps> = ({ 
  className = "", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Bar Chart Representation */}
        {/* First bar - standard color */}
        <rect
          x="3"
          y="12"
          width="2.5"
          height="8"
          className="fill-current text-primary"
          rx="1"
        />
        {/* Second bar - orange accent */}
        <rect
          x="7"
          y="8"
          width="2.5"
          height="12"
          className="fill-finhub-orange"
          rx="1"
        />
        {/* Third bar - standard color */}
        <rect
          x="11"
          y="6"
          width="2.5"
          height="14"
          className="fill-current text-primary"
          rx="1"
        />
        {/* Fourth bar - standard color */}
        <rect
          x="15"
          y="4"
          width="2.5"
          height="16"
          className="fill-current text-primary"
          rx="1"
        />
        {/* Fifth bar - standard color */}
        <rect
          x="19"
          y="10"
          width="2.5"
          height="10"
          className="fill-current text-primary"
          rx="1"
        />
      </svg>
    </div>
  );
}; 