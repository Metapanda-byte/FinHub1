'use client';

import React from 'react';
import { logoTokens } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export interface FinHubIQLogoProps {
  variant?: 'primary' | 'white' | 'black' | 'icon';
  layout?: 'horizontal' | 'stacked';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

const iconSizes = {
  small: 32,
  medium: 40,
  large: 48,
};

const variantColors = {
  primary: {
    finhub: 'text-white',
    iq: 'text-orange-500',
    graphic: 'text-white',
    graphicAccent: 'text-orange-500',
  },
  white: {
    finhub: 'text-white',
    iq: 'text-white',
    graphic: 'text-white',
    graphicAccent: 'text-white',
  },
  black: {
    finhub: 'text-black',
    iq: 'text-black',
    graphic: 'text-black',
    graphicAccent: 'text-black',
  },
  icon: {
    finhub: 'text-white',
    iq: 'text-orange-500',
    graphic: 'text-white',
    graphicAccent: 'text-orange-500',
  },
};

export function FinHubIQLogo({
  variant = 'primary',
  layout = 'horizontal',
  size = 'medium',
  className,
  showText = true,
  animated = false,
}: FinHubIQLogoProps) {
  const colors = variantColors[variant];
  const iconSize = iconSizes[size];

  // SVG Graphic Component - exactly matching variants page
  const LogoGraphic = () => (
    <svg
      viewBox="0 0 60 60"
      width={iconSize}
      height={iconSize}
      className="flex-shrink-0"
      style={{
        filter: variant === 'white' ? 'brightness(0) invert(1)' : 'none',
      }}
    >
      {/* Connected dots growth pattern */}
      <g className={cn('transition-all duration-300', animated && 'animate-pulse')}>
        {/* Connection lines */}
        <line 
          x1="20" 
          y1="40" 
          x2="30" 
          y2="30" 
          stroke={variant === 'black' ? '#1f2937' : '#ffffff'} 
          strokeWidth="1" 
        />
        <line 
          x1="30" 
          y1="30" 
          x2="40" 
          y2="20" 
          stroke="#f97316" 
          strokeWidth="2" 
          className={animated ? 'animate-pulse' : ''}
        />
        
        {/* Dots */}
        <circle 
          cx="20" 
          cy="40" 
          r="3" 
          fill={variant === 'black' ? '#1f2937' : '#ffffff'}
        />
        <circle 
          cx="30" 
          cy="30" 
          r="4" 
          fill={variant === 'black' ? '#1f2937' : '#ffffff'}
        />
        <circle 
          cx="40" 
          cy="20" 
          r="5" 
          fill="#f97316"
          className={animated ? 'animate-pulse' : ''}
        />
      </g>
    </svg>
  );

  // Text Component - exactly matching variants page structure
  const LogoText = () => (
    <div className={cn(
      'flex items-center', 
      layout === 'stacked' ? 'flex-col' : 'space-x-1'
    )}>
      <span className={cn('font-medium leading-none', colors.finhub, size === 'small' ? 'text-base' : size === 'medium' ? 'text-xl' : 'text-2xl')}>
        FinHub
      </span>
      <span className={cn('font-bold leading-none', colors.iq, size === 'small' ? 'text-base' : size === 'medium' ? 'text-xl' : 'text-2xl', animated && 'animate-pulse')}>
        IQ
      </span>
    </div>
  );

  // Icon-only version
  if (variant === 'icon' || !showText) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <LogoGraphic />
      </div>
    );
  }

  // Full logo version
  return (
    <div
      className={cn(
        'flex items-center',
        layout === 'stacked' ? 'flex-col space-y-2' : 'flex-row space-x-3',
        className
      )}
    >
      <LogoGraphic />
      <LogoText />
    </div>
  );
}

// Logo with glow effect
export function FinHubIQLogoGlow(props: FinHubIQLogoProps) {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 blur-sm opacity-50"
        style={{
          filter: `drop-shadow(0 0 12px ${logoTokens.effects.glow})`,
        }}
      >
        <FinHubIQLogo {...props} />
      </div>
      <div className="relative">
        <FinHubIQLogo {...props} />
      </div>
    </div>
  );
}

// Animated logo with hover effects
export function FinHubIQLogoAnimated(props: FinHubIQLogoProps) {
  return (
    <div className="group cursor-pointer transition-transform duration-300 hover:scale-105">
      <FinHubIQLogo {...props} animated={true} />
    </div>
  );
}

// Logo with background
export function FinHubIQLogoWithBackground({
  background = 'dark',
  ...props
}: FinHubIQLogoProps & { background?: 'dark' | 'light' | 'gradient' }) {
  const backgroundClasses = {
    dark: 'bg-gray-900 p-4 rounded-lg',
    light: 'bg-white p-4 rounded-lg shadow-md',
    gradient: 'bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg',
  };

  return (
    <div className={cn('inline-block', backgroundClasses[background])}>
      <FinHubIQLogo {...props} />
    </div>
  );
}

// Export all variations
export const LogoVariations = {
  Primary: (props: Omit<FinHubIQLogoProps, 'variant'>) => (
    <FinHubIQLogo variant="primary" {...props} />
  ),
  White: (props: Omit<FinHubIQLogoProps, 'variant'>) => (
    <FinHubIQLogo variant="white" {...props} />
  ),
  Black: (props: Omit<FinHubIQLogoProps, 'variant'>) => (
    <FinHubIQLogo variant="black" {...props} />
  ),
  Icon: (props: Omit<FinHubIQLogoProps, 'variant'>) => (
    <FinHubIQLogo variant="icon" {...props} />
  ),
  Glow: FinHubIQLogoGlow,
  Animated: FinHubIQLogoAnimated,
  WithBackground: FinHubIQLogoWithBackground,
};

export default FinHubIQLogo; 