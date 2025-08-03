'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface IconVariantProps {
  className?: string;
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}

// Growth Arrow Variants
const GrowthArrow1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 45 L30 15 L45 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30 15 L45 15 L45 30" stroke={primaryColor} strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const GrowthArrow2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 50 L50 10" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M35 10 L50 10 L50 25" stroke={primaryColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GrowthArrow3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 45 L25 35 L35 25 L45 15" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="45" cy="15" r="3" fill={accentColor} />
  </svg>
);

const GrowthArrow4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M20 40 L30 20 M30 20 L40 40" stroke={primaryColor} strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M30 20 L30 10" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M25 15 L30 10 L35 15" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GrowthArrow5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 45 L45 15" stroke={accentColor} strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M35 15 L45 15 L45 25" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Chart Variants
const Chart1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <rect x="15" y="35" width="8" height="15" fill={primaryColor} />
    <rect x="26" y="25" width="8" height="25" fill={primaryColor} />
    <rect x="37" y="15" width="8" height="35" fill={accentColor} />
  </svg>
);

const Chart2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 50 L10 10" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
    <path d="M10 50 L50 50" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
    <path d="M15 40 L25 30 L35 20 L45 10" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Chart3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="15" cy="40" r="2" fill={primaryColor} />
    <circle cx="25" cy="30" r="2" fill={primaryColor} />
    <circle cx="35" cy="25" r="2" fill={primaryColor} />
    <circle cx="45" cy="15" r="3" fill={accentColor} />
    <path d="M15 40 Q25 30 35 25 T45 15" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const Chart4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <rect x="15" y="40" width="6" height="10" fill={primaryColor} opacity="0.7" />
    <rect x="23" y="35" width="6" height="15" fill={primaryColor} opacity="0.7" />
    <rect x="31" y="25" width="6" height="25" fill={primaryColor} opacity="0.7" />
    <rect x="39" y="15" width="6" height="35" fill={accentColor} />
  </svg>
);

const Chart5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 45 L15 35 L25 35 L25 25 L35 25 L35 15 L45 15 L45 45 Z" 
          fill={accentColor} opacity="0.3" />
    <path d="M15 35 L25 25 L35 15 L45 15" 
          stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Curve Variants
const Curve1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 45 Q30 45 30 30 T50 15" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Curve2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 50 C15 30 25 20 45 10" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="45" cy="10" r="3" fill={accentColor} />
  </svg>
);

const Curve3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 40 Q20 35 25 30 T35 20 Q40 15 50 10" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Curve4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 45 C20 40 25 35 30 30" stroke={primaryColor} strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M30 30 C35 25 40 20 45 15" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Curve5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 50 Q30 40 50 10" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M40 10 L50 10 L50 20" stroke={primaryColor} strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

// Minimal Geometric
const Geometric1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="30" cy="30" r="20" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
    <path d="M30 40 L30 20" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M25 25 L30 20 L35 25" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Geometric2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <rect x="20" y="20" width="20" height="20" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
    <path d="M25 35 L35 25" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M30 25 L35 25 L35 30" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Geometric3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 10 L45 40 L15 40 Z" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
    <path d="M30 10 L30 25" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
    <circle cx="30" cy="10" r="3" fill={accentColor} />
  </svg>
);

const Geometric4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M20 30 L30 20 L40 30 L30 40 Z" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
    <path d="M30 40 L30 20" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M25 25 L30 20 L35 25" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Geometric5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <rect x="15" y="15" width="30" height="30" rx="5" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
    <path d="M25 35 L35 25" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// Abstract Growth
const Abstract1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 50 L30 10" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
    <circle cx="30" cy="40" r="3" fill={primaryColor} />
    <circle cx="30" cy="30" r="4" fill={primaryColor} />
    <circle cx="30" cy="20" r="5" fill={accentColor} />
  </svg>
);

const Abstract2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M20 40 L20 30 M30 40 L30 20 M40 40 L40 10" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Abstract3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 45 L15 40" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    <path d="M25 45 L25 35" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    <path d="M35 45 L35 25" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
    <path d="M45 45 L45 15" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Abstract4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="20" cy="40" r="2" fill={primaryColor} opacity="0.5" />
    <circle cx="30" cy="30" r="3" fill={primaryColor} opacity="0.7" />
    <circle cx="40" cy="20" r="4" fill={accentColor} />
    <path d="M20 40 L30 30 L40 20" stroke={accentColor} strokeWidth="1" fill="none" opacity="0.5" />
  </svg>
);

const Abstract5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <rect x="25" y="35" width="10" height="15" fill={primaryColor} opacity="0.3" />
    <rect x="25" y="25" width="10" height="10" fill={primaryColor} opacity="0.5" />
    <rect x="25" y="10" width="10" height="15" fill={accentColor} />
  </svg>
);

// Plant/Organic Growth
const Plant1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 50 L30 20" stroke={primaryColor} strokeWidth="2" />
    <path d="M30 30 Q20 25 20 15 Q20 10 25 10 Q30 10 30 20" fill="none" stroke={accentColor} strokeWidth="3" />
    <path d="M30 25 Q40 20 40 10 Q40 5 35 5 Q30 5 30 15" fill="none" stroke={primaryColor} strokeWidth="2" />
  </svg>
);

const Plant2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 45 L30 15" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
    <circle cx="25" cy="20" r="5" fill="none" stroke={primaryColor} strokeWidth="2" />
    <circle cx="35" cy="25" r="5" fill="none" stroke={primaryColor} strokeWidth="2" />
    <circle cx="30" cy="15" r="4" fill={accentColor} />
  </svg>
);

const Plant3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 50 C30 50 30 35 30 25 C30 15 35 10 40 10" stroke={primaryColor} strokeWidth="2" fill="none" />
    <path d="M30 25 C30 15 25 10 20 10" stroke={accentColor} strokeWidth="3" fill="none" />
    <circle cx="20" cy="10" r="3" fill={accentColor} />
  </svg>
);

const Plant4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 45 L30 20" stroke={primaryColor} strokeWidth="2" />
    <path d="M25 35 L30 30 L35 35" stroke={primaryColor} strokeWidth="2" fill="none" />
    <path d="M20 25 L30 15 L40 25" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Plant5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 50 L30 30" stroke={primaryColor} strokeWidth="2" />
    <path d="M30 30 Q20 30 15 20 Q10 10 20 10 Q30 10 30 20 Q30 10 40 10 Q50 10 45 20 Q40 30 30 30" 
          fill="none" stroke={accentColor} strokeWidth="3" />
  </svg>
);

// Signal/Wave Growth
const Signal1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 30 Q15 20 20 30 T30 30 Q35 20 40 30 T50 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Signal2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 40 L15 35" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M25 40 L25 30" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M35 40 L35 25" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M45 40 L45 20" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Signal3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="30" cy="30" r="5" fill={accentColor} />
    <circle cx="30" cy="30" r="10" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.7" />
    <circle cx="30" cy="30" r="15" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.5" />
    <circle cx="30" cy="30" r="20" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
  </svg>
);

const Signal4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 35 Q20 30 25 35 T35 35 Q40 30 45 35" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M15 25 Q20 20 25 25 T35 25 Q40 20 45 25" stroke={primaryColor} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const Signal5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 45 L30 15" stroke={primaryColor} strokeWidth="2" opacity="0.5" />
    <path d="M20 35 C20 35 25 25 30 15 C35 25 40 35 40 35" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

// Spark/Star Growth
const Spark1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 10 L30 50 M10 30 L50 30" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    <path d="M30 20 L30 40 M20 30 L40 30" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Spark2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 15 L32 25 L40 20 L35 28 L45 30 L35 32 L40 40 L32 35 L30 45 L28 35 L20 40 L25 32 L15 30 L25 28 L20 20 L28 25 Z" 
          fill={accentColor} opacity="0.9" />
  </svg>
);

const Spark3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 10 L30 20 M30 40 L30 50 M10 30 L20 30 M40 30 L50 30" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
    <circle cx="30" cy="30" r="8" fill={accentColor} />
  </svg>
);

const Spark4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 25 L30 10 M30 35 L30 50 M25 30 L10 30 M35 30 L50 30" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
    <circle cx="30" cy="30" r="5" fill={primaryColor} />
  </svg>
);

const Spark5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 20 Q30 10 30 10 Q30 20 40 20 Q30 20 30 30 Q30 20 20 20 Q30 20 30 10" 
          fill={accentColor} />
    <path d="M30 40 Q30 35 30 35 Q30 40 35 40 Q30 40 30 45 Q30 40 25 40 Q30 40 30 35" 
          fill={primaryColor} opacity="0.7" />
  </svg>
);

// Mountain/Peak
const Mountain1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 45 L30 15 L50 45" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="30" cy="15" r="3" fill={accentColor} />
  </svg>
);

const Mountain2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 45 L20 25 L30 35 L40 15 L50 45" stroke={primaryColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M40 15 L40 10" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M35 10 L40 5 L45 10" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Mountain3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 45 L25 30 L35 40 L45 20" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="45" cy="20" r="3" fill={accentColor} />
  </svg>
);

const Mountain4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 50 L25 20 L40 50" fill={primaryColor} opacity="0.3" />
    <path d="M30 40 L40 20 L50 40" fill={accentColor} opacity="0.8" />
  </svg>
);

const Mountain5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 45 L30 15 L45 45 Z" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M23 30 L30 15 L37 30" stroke={primaryColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Tree/Branch Growth
const Tree1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 50 L30 20" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M30 35 L20 25 M30 30 L40 20 M30 25 L25 15" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Tree2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 45 L30 30 M30 30 L20 20 M30 30 L40 20" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
    <circle cx="20" cy="20" r="3" fill={accentColor} />
    <circle cx="40" cy="20" r="3" fill={accentColor} />
    <circle cx="30" cy="15" r="4" fill={accentColor} />
  </svg>
);

const Tree3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 50 L30 25" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M20 35 L30 25 L40 35" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M25 25 L30 15 L35 25" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Tree4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 50 L30 10" stroke={primaryColor} strokeWidth="2" opacity="0.5" />
    <path d="M25 40 L30 35 L35 40 M20 30 L30 20 L40 30 M25 20 L30 10 L35 20" 
          stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Tree5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 50 L30 30" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
    <circle cx="30" cy="25" r="10" fill="none" stroke={accentColor} strokeWidth="3" />
    <circle cx="30" cy="25" r="5" fill={accentColor} opacity="0.3" />
  </svg>
);

// Rocket/Launch
const Rocket1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 10 L35 20 L35 35 L30 40 L25 35 L25 20 Z" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M25 35 L20 45 M35 35 L40 45" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Rocket2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 15 C30 15 25 20 25 30 C25 40 30 45 30 45 C30 45 35 40 35 30 C35 20 30 15 30 15" 
          stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="30" cy="25" r="3" fill={primaryColor} />
  </svg>
);

const Rocket3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 10 L30 40" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
    <path d="M25 15 L30 10 L35 15" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M25 40 L30 50 L35 40" stroke={primaryColor} strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const Rocket4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <rect x="25" y="20" width="10" height="20" rx="5" stroke={accentColor} strokeWidth="3" fill="none" />
    <path d="M25 40 L20 50 M35 40 L40 50 M30 40 L30 50" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
    <path d="M30 20 L30 10" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Rocket5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 45 L30 15 L25 25 L30 15 L35 25" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="30" cy="15" r="3" fill={accentColor} />
  </svg>
);

// Steps/Stairs
const Steps1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 45 L15 40 L25 40 L25 30 L35 30 L35 20 L45 20 L45 15" 
          stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Steps2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <rect x="15" y="40" width="10" height="5" fill={primaryColor} opacity="0.5" />
    <rect x="25" y="30" width="10" height="15" fill={primaryColor} opacity="0.7" />
    <rect x="35" y="20" width="10" height="25" fill={accentColor} />
  </svg>
);

const Steps3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 50 L20 50 L20 40 L30 40 L30 30 L40 30 L40 20 L50 20 L50 10" 
          stroke={primaryColor} strokeWidth="2" fill="none" opacity="0.5" />
    <circle cx="20" cy="45" r="2" fill={primaryColor} />
    <circle cx="30" cy="35" r="2" fill={primaryColor} />
    <circle cx="40" cy="25" r="2" fill={primaryColor} />
    <circle cx="50" cy="15" r="3" fill={accentColor} />
  </svg>
);

const Steps4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="15" y1="45" x2="25" y2="45" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
    <line x1="25" y1="35" x2="35" y2="35" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
    <line x1="35" y1="25" x2="45" y2="25" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
    <line x1="45" y1="15" x2="45" y2="25" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Steps5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 45 L25 45 L25 35 L35 35 L35 25 L45 25 L45 15" 
          stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M25 35 L15 25 M35 25 L25 15 M45 15 L35 5" 
          stroke={primaryColor} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// Additional Minimal Icons
const Minimal1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="15" y1="45" x2="45" y2="15" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const Minimal2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 45 L30 15 M20 25 L30 15 L40 25" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Minimal3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="30" cy="35" r="2" fill={primaryColor} />
    <circle cx="30" cy="25" r="3" fill={primaryColor} />
    <circle cx="30" cy="15" r="4" fill={accentColor} />
  </svg>
);

const Minimal4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M20 30 L30 20 L40 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Minimal5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <rect x="20" y="20" width="20" height="20" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
    <rect x="25" y="25" width="10" height="10" fill={accentColor} />
  </svg>
);

// Crescent Variants
const Crescent1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 10 A20 20 0 0 1 30 50 A15 15 0 0 0 30 10" fill={accentColor} />
  </svg>
);

const Crescent2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M20 30 A15 15 0 0 1 35 15 A15 15 0 0 0 20 30" fill={primaryColor} opacity="0.5" />
    <path d="M30 25 A15 15 0 0 1 45 40 A15 15 0 0 0 30 25" fill={accentColor} />
  </svg>
);

const Crescent3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="30" cy="30" r="20" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
    <path d="M30 10 A20 20 0 0 1 30 50 A10 10 0 0 0 30 10" fill={accentColor} />
  </svg>
);

const Crescent4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 30 A15 15 0 1 1 30 45 A10 10 0 1 0 15 30" fill={accentColor} />
    <circle cx="35" cy="25" r="3" fill={primaryColor} />
  </svg>
);

const Crescent5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M25 20 A10 10 0 0 1 35 30 A8 8 0 0 0 25 20" fill={primaryColor} opacity="0.5" />
    <path d="M30 30 A10 10 0 0 1 40 40 A8 8 0 0 0 30 30" fill={accentColor} />
  </svg>
);

// Semi-Circle Variants
const SemiCircle1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 30 A20 20 0 0 1 50 30 Z" fill={accentColor} />
  </svg>
);

const SemiCircle2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 40 A15 15 0 0 1 45 40 Z" fill={primaryColor} opacity="0.5" />
    <path d="M20 35 A10 10 0 0 1 40 35 Z" fill={accentColor} />
  </svg>
);

const SemiCircle3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 30 L30 10 A20 20 0 0 1 30 50 Z" fill={accentColor} />
    <path d="M30 30 L30 20 A10 10 0 0 1 30 40 Z" fill={primaryColor} opacity="0.5" />
  </svg>
);

const SemiCircle4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 30 A20 20 0 0 1 50 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="30" cy="30" r="3" fill={accentColor} />
  </svg>
);

const SemiCircle5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 30 A15 15 0 0 0 45 30" stroke={primaryColor} strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M20 30 A10 10 0 0 0 40 30" stroke={accentColor} strokeWidth="3" fill="none" />
  </svg>
);

// Pulse Wave Variants
const Pulse1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 30 L20 30 L25 20 L30 40 L35 15 L40 30 L50 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Pulse2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 30 L15 30 L20 25 L25 35 L30 20 L35 30 L40 30 L50 30" stroke={primaryColor} strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M25 35 L30 20 L35 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Pulse3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 30 L18 30 L22 15 L26 45 L30 30 L34 30 L38 20 L42 40 L46 30 L50 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Pulse4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="10" y1="30" x2="50" y2="30" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
    <path d="M15 30 L20 30 L25 10 L30 50 L35 30 L40 30 L45 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Pulse5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 35 L15 35 L20 30 L25 25 L30 40 L35 20 L40 30 L45 35 L50 35" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="35" cy="20" r="2" fill={accentColor} />
  </svg>
);

// Bar Chart Variants
const BarChart1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <rect x="10" y="35" width="8" height="15" fill={primaryColor} opacity="0.5" />
    <rect x="20" y="30" width="8" height="20" fill={primaryColor} opacity="0.5" />
    <rect x="30" y="20" width="8" height="30" fill={accentColor} />
    <rect x="40" y="25" width="8" height="25" fill={primaryColor} opacity="0.5" />
  </svg>
);

const BarChart2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <rect x="15" y="40" width="6" height="10" fill={primaryColor} />
    <rect x="22" y="35" width="6" height="15" fill={primaryColor} />
    <rect x="29" y="25" width="6" height="25" fill={primaryColor} />
    <rect x="36" y="15" width="6" height="35" fill={accentColor} />
    <rect x="43" y="20" width="6" height="30" fill={accentColor} opacity="0.7" />
  </svg>
);

const BarChart3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="10" y1="50" x2="50" y2="50" stroke={primaryColor} strokeWidth="2" />
    <rect x="15" y="45" width="5" height="5" fill={primaryColor} />
    <rect x="22" y="40" width="5" height="10" fill={primaryColor} />
    <rect x="29" y="30" width="5" height="20" fill={accentColor} />
    <rect x="36" y="20" width="5" height="30" fill={accentColor} />
    <rect x="43" y="25" width="5" height="25" fill={accentColor} opacity="0.7" />
  </svg>
);

const BarChart4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <rect x="10" y="30" width="40" height="2" fill={primaryColor} opacity="0.3" />
    <rect x="10" y="35" width="10" height="15" fill={primaryColor} opacity="0.5" />
    <rect x="25" y="25" width="10" height="25" fill={primaryColor} opacity="0.7" />
    <rect x="40" y="15" width="10" height="35" fill={accentColor} />
  </svg>
);

const BarChart5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <rect x="12" y="45" width="4" height="5" fill={primaryColor} opacity="0.5" />
    <rect x="18" y="40" width="4" height="10" fill={primaryColor} opacity="0.5" />
    <rect x="24" y="35" width="4" height="15" fill={primaryColor} opacity="0.7" />
    <rect x="30" y="25" width="4" height="25" fill={accentColor} />
    <rect x="36" y="20" width="4" height="30" fill={accentColor} />
    <rect x="42" y="15" width="4" height="35" fill={accentColor} />
  </svg>
);

// Circle Segments
const CircleSegment1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="30" cy="30" r="20" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
    <path d="M30 10 A20 20 0 0 1 50 30 L30 30 Z" fill={accentColor} />
  </svg>
);

const CircleSegment2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 30 L30 10 A20 20 0 0 1 45.32 20 Z" fill={primaryColor} opacity="0.5" />
    <path d="M30 30 L45.32 20 A20 20 0 0 1 45.32 40 Z" fill={accentColor} />
  </svg>
);

const CircleSegment3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="30" cy="30" r="20" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
    <path d="M30 30 L30 10 A20 20 0 0 1 50 30 Z" fill={accentColor} />
    <path d="M30 30 L50 30 A20 20 0 0 1 30 50 Z" fill={primaryColor} opacity="0.5" />
  </svg>
);

const CircleSegment4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 10 A20 20 0 0 1 50 30 A20 20 0 0 1 30 50" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="30" cy="10" r="3" fill={accentColor} />
  </svg>
);

const CircleSegment5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="30" cy="30" r="20" fill="none" stroke={primaryColor} strokeWidth="8" strokeDasharray="31.4 31.4" strokeDashoffset="0" opacity="0.3" />
    <circle cx="30" cy="30" r="20" fill="none" stroke={accentColor} strokeWidth="8" strokeDasharray="31.4 94.2" strokeDashoffset="0" strokeLinecap="round" />
  </svg>
);

// Wave Forms
const WaveForm1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 30 C15 20 20 40 25 30 C30 20 35 40 40 30 C45 20 50 30 50 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const WaveForm2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 35 Q20 25 30 35 T50 35" stroke={primaryColor} strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M10 30 Q20 20 30 30 T50 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const WaveForm3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 30 C10 30 20 10 30 30 C40 50 50 30 50 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const WaveForm4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 40 L15 20 L20 35 L25 25 L30 40 L35 15 L40 30 L45 25 L50 40" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WaveForm5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="10" y1="30" x2="50" y2="30" stroke={primaryColor} strokeWidth="1" opacity="0.3" />
    <path d="M10 30 C15 30 15 20 20 20 C25 20 25 40 30 40 C35 40 35 15 40 15 C45 15 45 30 50 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

// Arc Variants
const Arc1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 35 Q30 15 45 35" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Arc2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 40 Q30 10 50 40" stroke={primaryColor} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
    <path d="M15 35 Q30 20 45 35" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Arc3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M20 40 Q30 20 40 40" stroke={accentColor} strokeWidth="4" fill="none" strokeLinecap="round" />
    <circle cx="30" cy="20" r="3" fill={accentColor} />
  </svg>
);

const Arc4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 30 Q30 20 45 30" stroke={primaryColor} strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M20 30 Q30 15 40 30" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M25 30 Q30 20 35 30" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const Arc5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M10 45 Q20 25 30 35 Q40 45 50 25" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

// Line Patterns
const Lines1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="20" y1="40" x2="20" y2="35" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    <line x1="30" y1="40" x2="30" y2="25" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    <line x1="40" y1="40" x2="40" y2="15" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Lines2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="15" y1="45" x2="25" y2="35" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <line x1="25" y1="35" x2="35" y2="25" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <line x1="35" y1="25" x2="45" y2="15" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Lines3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="10" y1="30" x2="20" y2="30" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
    <line x1="25" y1="30" x2="35" y2="30" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
    <line x1="40" y1="30" x2="50" y2="30" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
    <line x1="30" y1="40" x2="30" y2="20" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Lines4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="15" y1="20" x2="15" y2="40" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <line x1="22" y1="15" x2="22" y2="40" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <line x1="29" y1="10" x2="29" y2="40" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
    <line x1="36" y1="15" x2="36" y2="40" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
    <line x1="43" y1="20" x2="43" y2="40" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Lines5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 35 L20 30 L25 35 L30 25 L35 35 L40 20 L45 35" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Dot Patterns
const Dots1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="20" cy="30" r="3" fill={primaryColor} opacity="0.5" />
    <circle cx="30" cy="25" r="4" fill={primaryColor} opacity="0.7" />
    <circle cx="40" cy="20" r="5" fill={accentColor} />
  </svg>
);

const Dots2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="15" cy="35" r="2" fill={primaryColor} />
    <circle cx="22" cy="30" r="2" fill={primaryColor} />
    <circle cx="29" cy="25" r="2" fill={primaryColor} />
    <circle cx="36" cy="20" r="3" fill={accentColor} />
    <circle cx="43" cy="15" r="3" fill={accentColor} />
  </svg>
);

const Dots3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="20" cy="40" r="2" fill={primaryColor} opacity="0.3" />
    <circle cx="30" cy="40" r="2" fill={primaryColor} opacity="0.5" />
    <circle cx="40" cy="40" r="2" fill={primaryColor} opacity="0.7" />
    <circle cx="25" cy="30" r="3" fill={primaryColor} opacity="0.5" />
    <circle cx="35" cy="30" r="3" fill={primaryColor} opacity="0.7" />
    <circle cx="30" cy="20" r="4" fill={accentColor} />
  </svg>
);

const Dots4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="30" cy="30" r="15" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
    <circle cx="30" cy="15" r="3" fill={accentColor} />
    <circle cx="40" cy="25" r="2" fill={primaryColor} />
    <circle cx="40" cy="35" r="2" fill={primaryColor} />
    <circle cx="30" cy="45" r="2" fill={primaryColor} />
    <circle cx="20" cy="35" r="2" fill={primaryColor} />
    <circle cx="20" cy="25" r="2" fill={primaryColor} />
  </svg>
);

const Dots5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="15" cy="45" r="1.5" fill={primaryColor} />
    <circle cx="20" cy="40" r="2" fill={primaryColor} />
    <circle cx="25" cy="35" r="2.5" fill={primaryColor} />
    <circle cx="30" cy="30" r="3" fill={primaryColor} />
    <circle cx="35" cy="25" r="3.5" fill={accentColor} />
    <circle cx="40" cy="20" r="4" fill={accentColor} />
    <circle cx="45" cy="15" r="4.5" fill={accentColor} />
  </svg>
);

// Triangle Variants
const Triangle1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 15 L40 35 L20 35 Z" fill={accentColor} />
  </svg>
);

const Triangle2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 20 L35 30 L25 30 Z" fill={primaryColor} opacity="0.5" />
    <path d="M30 10 L40 35 L20 35 Z" stroke={accentColor} strokeWidth="3" fill="none" />
  </svg>
);

const Triangle3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M20 40 L30 20 L40 40" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="30" cy="20" r="3" fill={accentColor} />
  </svg>
);

const Triangle4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M25 35 L30 25 L35 35 Z" fill={primaryColor} opacity="0.5" />
    <path d="M20 45 L30 15 L40 45 Z" fill={accentColor} opacity="0.8" />
  </svg>
);

const Triangle5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M30 45 L15 25 L45 25 Z" stroke={primaryColor} strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M30 35 L20 20 L40 20 Z" fill={accentColor} />
  </svg>
);

// Connected Dots Variants (inspired by #24)
const Connected1: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="20" y1="40" x2="30" y2="30" stroke={primaryColor} strokeWidth="1" />
    <line x1="30" y1="30" x2="40" y2="20" stroke={accentColor} strokeWidth="2" />
    <circle cx="20" cy="40" r="3" fill={primaryColor} />
    <circle cx="30" cy="30" r="4" fill={primaryColor} />
    <circle cx="40" cy="20" r="5" fill={accentColor} />
  </svg>
);

const Connected2: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="15" y1="35" x2="25" y2="25" stroke={primaryColor} strokeWidth="1" opacity="0.3" />
    <line x1="25" y1="25" x2="35" y2="35" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
    <line x1="35" y1="35" x2="45" y2="15" stroke={accentColor} strokeWidth="2" />
    <circle cx="15" cy="35" r="2" fill={primaryColor} opacity="0.5" />
    <circle cx="25" cy="25" r="3" fill={primaryColor} opacity="0.7" />
    <circle cx="35" cy="35" r="3" fill={primaryColor} />
    <circle cx="45" cy="15" r="6" fill={accentColor} />
  </svg>
);

const Connected3: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="30" y1="45" x2="30" y2="35" stroke={primaryColor} strokeWidth="1" opacity="0.4" />
    <line x1="30" y1="35" x2="30" y2="25" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
    <line x1="30" y1="25" x2="30" y2="15" stroke={accentColor} strokeWidth="2" />
    <circle cx="30" cy="45" r="2" fill={primaryColor} opacity="0.4" />
    <circle cx="30" cy="35" r="3" fill={primaryColor} opacity="0.6" />
    <circle cx="30" cy="25" r="4" fill={primaryColor} opacity="0.8" />
    <circle cx="30" cy="15" r="5" fill={accentColor} />
  </svg>
);

const Connected4: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="20" y1="30" x2="30" y2="20" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
    <line x1="30" y1="20" x2="40" y2="30" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
    <line x1="30" y1="20" x2="30" y2="40" stroke={accentColor} strokeWidth="2" />
    <circle cx="20" cy="30" r="3" fill={primaryColor} opacity="0.7" />
    <circle cx="40" cy="30" r="3" fill={primaryColor} opacity="0.7" />
    <circle cx="30" cy="40" r="2" fill={primaryColor} opacity="0.5" />
    <circle cx="30" cy="20" r="5" fill={accentColor} />
  </svg>
);

const Connected5: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="15" y1="45" x2="22" y2="38" stroke={primaryColor} strokeWidth="1" opacity="0.3" />
    <line x1="22" y1="38" x2="30" y2="30" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
    <line x1="30" y1="30" x2="38" y2="22" stroke={primaryColor} strokeWidth="1" opacity="0.7" />
    <line x1="38" y1="22" x2="45" y2="15" stroke={accentColor} strokeWidth="2" />
    <circle cx="15" cy="45" r="1.5" fill={primaryColor} opacity="0.3" />
    <circle cx="22" cy="38" r="2" fill={primaryColor} opacity="0.5" />
    <circle cx="30" cy="30" r="2.5" fill={primaryColor} opacity="0.7" />
    <circle cx="38" cy="22" r="3" fill={primaryColor} />
    <circle cx="45" cy="15" r="4" fill={accentColor} />
  </svg>
);

const Connected6: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="20" y1="20" x2="40" y2="20" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
    <line x1="40" y1="20" x2="40" y2="40" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
    <line x1="40" y1="40" x2="20" y2="40" stroke={accentColor} strokeWidth="2" />
    <circle cx="20" cy="20" r="3" fill={primaryColor} opacity="0.7" />
    <circle cx="40" cy="20" r="2" fill={primaryColor} opacity="0.5" />
    <circle cx="40" cy="40" r="4" fill={primaryColor} />
    <circle cx="20" cy="40" r="5" fill={accentColor} />
  </svg>
);

const Connected7: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="30" y1="30" x2="45" y2="20" stroke={accentColor} strokeWidth="2" />
    <line x1="30" y1="30" x2="15" y2="35" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
    <line x1="30" y1="30" x2="35" y2="45" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
    <circle cx="30" cy="30" r="6" fill={accentColor} />
    <circle cx="45" cy="20" r="3" fill={primaryColor} opacity="0.7" />
    <circle cx="15" cy="35" r="2" fill={primaryColor} opacity="0.5" />
    <circle cx="35" cy="45" r="2" fill={primaryColor} opacity="0.5" />
  </svg>
);

const Connected8: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="15" y1="30" x2="25" y2="30" stroke={primaryColor} strokeWidth="1" opacity="0.4" />
    <line x1="25" y1="30" x2="35" y2="30" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
    <line x1="35" y1="30" x2="45" y2="30" stroke={accentColor} strokeWidth="2" />
    <circle cx="15" cy="30" r="2" fill={primaryColor} opacity="0.4" />
    <circle cx="25" cy="30" r="3" fill={primaryColor} opacity="0.6" />
    <circle cx="35" cy="30" r="4" fill={primaryColor} opacity="0.8" />
    <circle cx="45" cy="30" r="5" fill={accentColor} />
  </svg>
);

const Connected9: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="30" y1="15" x2="15" y2="30" stroke={primaryColor} strokeWidth="1" opacity="0.4" />
    <line x1="15" y1="30" x2="30" y2="45" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
    <line x1="30" y1="45" x2="45" y2="30" stroke={accentColor} strokeWidth="2" />
    <line x1="45" y1="30" x2="30" y2="15" stroke={accentColor} strokeWidth="2" />
    <circle cx="30" cy="15" r="2" fill={primaryColor} opacity="0.4" />
    <circle cx="15" cy="30" r="3" fill={primaryColor} opacity="0.6" />
    <circle cx="30" cy="45" r="3" fill={primaryColor} opacity="0.8" />
    <circle cx="45" cy="30" r="4" fill={accentColor} />
  </svg>
);

const Connected10: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="20" y1="35" x2="30" y2="25" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
    <line x1="30" y1="25" x2="40" y2="35" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
    <line x1="25" y1="40" x2="35" y2="40" stroke={accentColor} strokeWidth="2" />
    <circle cx="20" cy="35" r="2" fill={primaryColor} opacity="0.5" />
    <circle cx="30" cy="25" r="5" fill={accentColor} />
    <circle cx="40" cy="35" r="2" fill={primaryColor} opacity="0.5" />
    <circle cx="25" cy="40" r="1.5" fill={primaryColor} opacity="0.3" />
    <circle cx="35" cy="40" r="1.5" fill={primaryColor} opacity="0.3" />
  </svg>
);

const Connected11: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <path d="M15 30 Q30 15 45 30" stroke={accentColor} strokeWidth="2" fill="none" />
    <circle cx="15" cy="30" r="3" fill={primaryColor} opacity="0.7" />
    <circle cx="30" cy="18" r="2" fill={primaryColor} opacity="0.5" />
    <circle cx="45" cy="30" r="4" fill={accentColor} />
  </svg>
);

const Connected12: React.FC<IconVariantProps> = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="30" y1="30" x2="20" y2="20" stroke={primaryColor} strokeWidth="1" opacity="0.4" />
    <line x1="30" y1="30" x2="40" y2="20" stroke={primaryColor} strokeWidth="1" opacity="0.6" />
    <line x1="30" y1="30" x2="20" y2="40" stroke={primaryColor} strokeWidth="1" opacity="0.4" />
    <line x1="30" y1="30" x2="40" y2="40" stroke={accentColor} strokeWidth="2" />
    <circle cx="30" cy="30" r="3" fill={primaryColor} />
    <circle cx="20" cy="20" r="2" fill={primaryColor} opacity="0.4" />
    <circle cx="40" cy="20" r="2" fill={primaryColor} opacity="0.6" />
    <circle cx="20" cy="40" r="2" fill={primaryColor} opacity="0.4" />
    <circle cx="40" cy="40" r="4" fill={accentColor} />
  </svg>
);

const iconVariants = [
  // Growth Arrows (5)
  { Component: GrowthArrow1, name: 'Growth Arrow 1', category: 'arrows' },
  { Component: GrowthArrow2, name: 'Growth Arrow 2', category: 'arrows' },
  { Component: GrowthArrow3, name: 'Growth Arrow 3', category: 'arrows' },
  { Component: GrowthArrow4, name: 'Growth Arrow 4', category: 'arrows' },
  { Component: GrowthArrow5, name: 'Growth Arrow 5', category: 'arrows' },
  
  // Charts (5)
  { Component: Chart1, name: 'Bar Chart', category: 'charts' },
  { Component: Chart2, name: 'Line Chart', category: 'charts' },
  { Component: Chart3, name: 'Dot Chart', category: 'charts' },
  { Component: Chart4, name: 'Growth Bars', category: 'charts' },
  { Component: Chart5, name: 'Area Chart', category: 'charts' },
  
  // Curves (5)
  { Component: Curve1, name: 'S-Curve', category: 'curves' },
  { Component: Curve2, name: 'Growth Curve', category: 'curves' },
  { Component: Curve3, name: 'Wave Curve', category: 'curves' },
  { Component: Curve4, name: 'Split Curve', category: 'curves' },
  { Component: Curve5, name: 'Arrow Curve', category: 'curves' },
  
  // Geometric (5)
  { Component: Geometric1, name: 'Circle Arrow', category: 'geometric' },
  { Component: Geometric2, name: 'Square Arrow', category: 'geometric' },
  { Component: Geometric3, name: 'Triangle Up', category: 'geometric' },
  { Component: Geometric4, name: 'Diamond Arrow', category: 'geometric' },
  { Component: Geometric5, name: 'Rounded Square', category: 'geometric' },
  
  // Abstract (5)
  { Component: Abstract1, name: 'Growing Dots', category: 'abstract' },
  { Component: Abstract2, name: 'Rising Lines', category: 'abstract' },
  { Component: Abstract3, name: 'Progress Bars', category: 'abstract' },
  { Component: Abstract4, name: 'Connected Dots', category: 'abstract' },
  { Component: Abstract5, name: 'Stacked Growth', category: 'abstract' },
  
  // Plant/Organic (5)
  { Component: Plant1, name: 'Leaf Growth', category: 'organic' },
  { Component: Plant2, name: 'Branch Nodes', category: 'organic' },
  { Component: Plant3, name: 'Split Branch', category: 'organic' },
  { Component: Plant4, name: 'Tree Arrow', category: 'organic' },
  { Component: Plant5, name: 'Double Leaf', category: 'organic' },
  
  // Signal/Wave (5)
  { Component: Signal1, name: 'Wave Signal', category: 'signals' },
  { Component: Signal2, name: 'Signal Bars', category: 'signals' },
  { Component: Signal3, name: 'Ripple Effect', category: 'signals' },
  { Component: Signal4, name: 'Double Wave', category: 'signals' },
  { Component: Signal5, name: 'Peak Signal', category: 'signals' },
  
  // Spark/Star (5)
  { Component: Spark1, name: 'Cross Spark', category: 'sparks' },
  { Component: Spark2, name: 'Star Burst', category: 'sparks' },
  { Component: Spark3, name: 'Center Glow', category: 'sparks' },
  { Component: Spark4, name: 'Plus Spark', category: 'sparks' },
  { Component: Spark5, name: 'Diamond Spark', category: 'sparks' },
  
  // Mountain/Peak (5)
  { Component: Mountain1, name: 'Single Peak', category: 'peaks' },
  { Component: Mountain2, name: 'Multi Peak', category: 'peaks' },
  { Component: Mountain3, name: 'Rising Peak', category: 'peaks' },
  { Component: Mountain4, name: 'Layered Mountains', category: 'peaks' },
  { Component: Mountain5, name: 'Outlined Peak', category: 'peaks' },
  
  // Tree/Branch (5)
  { Component: Tree1, name: 'Branch Growth', category: 'trees' },
  { Component: Tree2, name: 'Node Tree', category: 'trees' },
  { Component: Tree3, name: 'Layered Tree', category: 'trees' },
  { Component: Tree4, name: 'Full Tree', category: 'trees' },
  { Component: Tree5, name: 'Circle Tree', category: 'trees' },
  
  // Rocket/Launch (5)
  { Component: Rocket1, name: 'Rocket Ship', category: 'rockets' },
  { Component: Rocket2, name: 'Streamlined', category: 'rockets' },
  { Component: Rocket3, name: 'Arrow Rocket', category: 'rockets' },
  { Component: Rocket4, name: 'Launch Pad', category: 'rockets' },
  { Component: Rocket5, name: 'Speed Arrow', category: 'rockets' },
  
  // Steps/Stairs (5)
  { Component: Steps1, name: 'Stairway', category: 'steps' },
  { Component: Steps2, name: 'Bar Steps', category: 'steps' },
  { Component: Steps3, name: 'Dot Steps', category: 'steps' },
  { Component: Steps4, name: 'Level Lines', category: 'steps' },
  { Component: Steps5, name: 'Progress Steps', category: 'steps' },
  
  // Additional Minimal (5)
  { Component: Minimal1, name: 'Simple Line', category: 'minimal' },
  { Component: Minimal2, name: 'Up Arrow', category: 'minimal' },
  { Component: Minimal3, name: 'Growing Dots', category: 'minimal' },
  { Component: Minimal4, name: 'Chevron Up', category: 'minimal' },
  { Component: Minimal5, name: 'Focus Square', category: 'minimal' },
  
  // Crescent (5)
  { Component: Crescent1, name: 'Full Crescent', category: 'crescents' },
  { Component: Crescent2, name: 'Double Crescent', category: 'crescents' },
  { Component: Crescent3, name: 'Framed Crescent', category: 'crescents' },
  { Component: Crescent4, name: 'Star Crescent', category: 'crescents' },
  { Component: Crescent5, name: 'Layered Crescent', category: 'crescents' },
  
  // Semi-Circle (5)
  { Component: SemiCircle1, name: 'Simple Semi', category: 'semicircles' },
  { Component: SemiCircle2, name: 'Nested Semi', category: 'semicircles' },
  { Component: SemiCircle3, name: 'Half Pie', category: 'semicircles' },
  { Component: SemiCircle4, name: 'Arc Dot', category: 'semicircles' },
  { Component: SemiCircle5, name: 'Double Arc', category: 'semicircles' },
  
  // Pulse Wave (5)
  { Component: Pulse1, name: 'Heartbeat', category: 'pulses' },
  { Component: Pulse2, name: 'Peak Pulse', category: 'pulses' },
  { Component: Pulse3, name: 'Multi Pulse', category: 'pulses' },
  { Component: Pulse4, name: 'Line Pulse', category: 'pulses' },
  { Component: Pulse5, name: 'Dot Pulse', category: 'pulses' },
  
  // Bar Charts (5)
  { Component: BarChart1, name: 'Simple Bars', category: 'barcharts' },
  { Component: BarChart2, name: 'Growth Bars', category: 'barcharts' },
  { Component: BarChart3, name: 'Baseline Bars', category: 'barcharts' },
  { Component: BarChart4, name: 'Horizontal Base', category: 'barcharts' },
  { Component: BarChart5, name: 'Progressive Bars', category: 'barcharts' },
  
  // Circle Segments (5)
  { Component: CircleSegment1, name: 'Quarter Pie', category: 'segments' },
  { Component: CircleSegment2, name: 'Double Segment', category: 'segments' },
  { Component: CircleSegment3, name: 'Half Circle', category: 'segments' },
  { Component: CircleSegment4, name: 'Arc Progress', category: 'segments' },
  { Component: CircleSegment5, name: 'Dashed Progress', category: 'segments' },
  
  // Wave Forms (5)
  { Component: WaveForm1, name: 'Sine Wave', category: 'waveforms' },
  { Component: WaveForm2, name: 'Double Wave', category: 'waveforms' },
  { Component: WaveForm3, name: 'Peak Wave', category: 'waveforms' },
  { Component: WaveForm4, name: 'Jagged Wave', category: 'waveforms' },
  { Component: WaveForm5, name: 'Step Wave', category: 'waveforms' },
  
  // Arcs (5)
  { Component: Arc1, name: 'Simple Arc', category: 'arcs' },
  { Component: Arc2, name: 'Nested Arc', category: 'arcs' },
  { Component: Arc3, name: 'Peak Arc', category: 'arcs' },
  { Component: Arc4, name: 'Triple Arc', category: 'arcs' },
  { Component: Arc5, name: 'Wave Arc', category: 'arcs' },
  
  // Line Patterns (5)
  { Component: Lines1, name: 'Vertical Lines', category: 'linepatterns' },
  { Component: Lines2, name: 'Diagonal Lines', category: 'linepatterns' },
  { Component: Lines3, name: 'Cross Lines', category: 'linepatterns' },
  { Component: Lines4, name: 'Rising Lines', category: 'linepatterns' },
  { Component: Lines5, name: 'Zigzag Line', category: 'linepatterns' },
  
  // Dot Patterns (5)
  { Component: Dots1, name: 'Growing Dots', category: 'dotpatterns' },
  { Component: Dots2, name: 'Dot Trail', category: 'dotpatterns' },
  { Component: Dots3, name: 'Dot Pyramid', category: 'dotpatterns' },
  { Component: Dots4, name: 'Dot Circle', category: 'dotpatterns' },
  { Component: Dots5, name: 'Dot Progression', category: 'dotpatterns' },
  
  // Triangle (5)
  { Component: Triangle1, name: 'Solid Triangle', category: 'triangles' },
  { Component: Triangle2, name: 'Outlined Triangle', category: 'triangles' },
  { Component: Triangle3, name: 'Peak Triangle', category: 'triangles' },
  { Component: Triangle4, name: 'Nested Triangle', category: 'triangles' },
  { Component: Triangle5, name: 'Inverted Triangle', category: 'triangles' },
  
  // Connected Dots/Planets (12)
  { Component: Connected1, name: 'Linear Growth', category: 'connected' },
  { Component: Connected2, name: 'Peak Connection', category: 'connected' },
  { Component: Connected3, name: 'Vertical Chain', category: 'connected' },
  { Component: Connected4, name: 'Hub Network', category: 'connected' },
  { Component: Connected5, name: 'Diagonal Path', category: 'connected' },
  { Component: Connected6, name: 'Square Path', category: 'connected' },
  { Component: Connected7, name: 'Central Hub', category: 'connected' },
  { Component: Connected8, name: 'Horizontal Chain', category: 'connected' },
  { Component: Connected9, name: 'Diamond Network', category: 'connected' },
  { Component: Connected10, name: 'Triangle Hub', category: 'connected' },
  { Component: Connected11, name: 'Curved Connection', category: 'connected' },
  { Component: Connected12, name: 'Star Network', category: 'connected' },
];

const categories = [
  { id: 'all', name: 'All Icons', count: iconVariants.length },
  { id: 'arrows', name: 'Growth Arrows', count: 5 },
  { id: 'charts', name: 'Charts', count: 5 },
  { id: 'curves', name: 'Curves', count: 5 },
  { id: 'geometric', name: 'Geometric', count: 5 },
  { id: 'abstract', name: 'Abstract', count: 5 },
  { id: 'organic', name: 'Organic', count: 5 },
  { id: 'signals', name: 'Signals', count: 5 },
  { id: 'sparks', name: 'Sparks', count: 5 },
  { id: 'peaks', name: 'Peaks', count: 5 },
  { id: 'trees', name: 'Trees', count: 5 },
  { id: 'rockets', name: 'Rockets', count: 5 },
  { id: 'steps', name: 'Steps', count: 5 },
  { id: 'minimal', name: 'Minimal', count: 5 },
  { id: 'crescents', name: 'Crescents', count: 5 },
  { id: 'semicircles', name: 'Semi-Circles', count: 5 },
  { id: 'pulses', name: 'Pulse Waves', count: 5 },
  { id: 'barcharts', name: 'Bar Charts', count: 5 },
  { id: 'segments', name: 'Circle Segments', count: 5 },
  { id: 'waveforms', name: 'Wave Forms', count: 5 },
  { id: 'arcs', name: 'Arcs', count: 5 },
  { id: 'linepatterns', name: 'Line Patterns', count: 5 },
  { id: 'dotpatterns', name: 'Dot Patterns', count: 5 },
  { id: 'triangles', name: 'Triangles', count: 5 },
  { id: 'connected', name: 'Connected', count: 12 },
];

export default function LogoVariantsPage() {
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bgColor, setBgColor] = useState('#1f2937');
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#f97316');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('finhub-logo-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('finhub-logo-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (index: number) => {
    setFavorites(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredIcons = selectedCategory === 'all' 
    ? iconVariants 
    : iconVariants.filter(icon => icon.category === selectedCategory);
  
  const displayIcons = showFavorites 
    ? iconVariants.filter((_, index) => favorites.includes(index))
    : filteredIcons;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FinHubIQ Logo Icon Variants</h1>
          <p className="text-gray-600">122 minimalist, elegant growth-focused icon designs</p>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Categories</h2>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
                showFavorites
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <svg className="w-5 h-5" fill={showFavorites ? 'white' : 'currentColor'} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Favorites ({favorites.length})
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {!showFavorites && categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all',
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {category.name} ({category.count})
              </button>
            ))}
            {showFavorites && (
              <p className="text-gray-600">Showing your favorite icons</p>
            )}
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Customization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent (Orange)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {displayIcons.map((variant) => {
            const IconComponent = variant.Component;
            const globalIndex = iconVariants.indexOf(variant);
            const isFavorite = favorites.includes(globalIndex);
            
            return (
              <div
                key={globalIndex}
                className={cn(
                  'bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 relative',
                  'hover:shadow-xl hover:scale-105',
                  selectedVariant === globalIndex && 'ring-4 ring-orange-500'
                )}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(globalIndex);
                  }}
                  className={cn(
                    'absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all',
                    isFavorite 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : 'bg-white/80 text-gray-600 hover:bg-white hover:text-orange-500'
                  )}
                >
                  <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <div 
                  className="p-6 flex items-center justify-center"
                  style={{ backgroundColor: bgColor }}
                  onClick={() => setSelectedVariant(globalIndex)}
                >
                  <IconComponent 
                    size={60} 
                    primaryColor={primaryColor}
                    accentColor={accentColor}
                    className="transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-3 bg-gray-50" onClick={() => setSelectedVariant(globalIndex)}>
                  <h3 className="text-xs font-medium text-gray-900 truncate">{variant.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">#{globalIndex + 1}</p>
                </div>
              </div>
            );
          })}
        </div>

        {selectedVariant !== null && (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Selected: {iconVariants[selectedVariant].name} (#{selectedVariant + 1})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-3">Small (40px)</h3>
                  <div 
                    className="inline-block p-4 rounded-lg"
                    style={{ backgroundColor: bgColor }}
                  >
                    {React.createElement(iconVariants[selectedVariant].Component, {
                      size: 40,
                      primaryColor,
                      accentColor
                    })}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-3">Medium (60px)</h3>
                  <div 
                    className="inline-block p-4 rounded-lg"
                    style={{ backgroundColor: bgColor }}
                  >
                    {React.createElement(iconVariants[selectedVariant].Component, {
                      size: 60,
                      primaryColor,
                      accentColor
                    })}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-3">Large (80px)</h3>
                  <div 
                    className="inline-block p-4 rounded-lg"
                    style={{ backgroundColor: bgColor }}
                  >
                    {React.createElement(iconVariants[selectedVariant].Component, {
                      size: 80,
                      primaryColor,
                      accentColor
                    })}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-3">XL (120px)</h3>
                  <div 
                    className="inline-block p-4 rounded-lg"
                    style={{ backgroundColor: bgColor }}
                  >
                    {React.createElement(iconVariants[selectedVariant].Component, {
                      size: 120,
                      primaryColor,
                      accentColor
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Light/Dark Mode Preview with FinHubIQ Text */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-6">Logo Context Preview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Light Mode */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Light Mode</h3>
                  <div className="bg-white rounded-lg p-8 border border-gray-200">
                    <div className="flex items-center justify-center gap-4">
                      {React.createElement(iconVariants[selectedVariant].Component, {
                        size: 50,
                        primaryColor: '#1f2937',
                        accentColor: '#f97316'
                      })}
                      <div className="flex items-center">
                        <span className="text-3xl font-medium text-gray-900">FinHub</span>
                        <span className="text-3xl font-bold text-orange-500">IQ</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Dark Mode */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Dark Mode</h3>
                  <div className="bg-gray-900 rounded-lg p-8">
                    <div className="flex items-center justify-center gap-4">
                      {React.createElement(iconVariants[selectedVariant].Component, {
                        size: 50,
                        primaryColor: '#ffffff',
                        accentColor: '#f97316'
                      })}
                      <div className="flex items-center">
                        <span className="text-3xl font-medium text-white">FinHub</span>
                        <span className="text-3xl font-bold text-orange-500">IQ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Preview Section */}
        {favorites.length > 0 && !showFavorites && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Your Favorites ({favorites.length})</h2>
              <button
                onClick={() => setShowFavorites(true)}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Light Mode Favorites */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-900">Light Mode</h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  {favorites.slice(0, 3).map((index) => {
                    const variant = iconVariants[index];
                    return (
                      <div key={index} className="flex items-center gap-2 bg-white p-4 rounded-lg">
                        {React.createElement(variant.Component, {
                          size: 40,
                          primaryColor: '#1f2937',
                          accentColor: '#f97316'
                        })}
                        <div className="flex items-center space-x-1">
                          <span className="text-xl font-medium text-gray-900">FinHub</span>
                          <span className="text-xl font-bold text-orange-500">IQ</span>
                        </div>
                        <span className="ml-auto text-sm text-gray-500">#{index + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Dark Mode Favorites */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-900">Dark Mode</h3>
                <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                  {favorites.slice(0, 3).map((index) => {
                    const variant = iconVariants[index];
                    return (
                      <div key={index} className="flex items-center gap-2 bg-gray-800 p-4 rounded-lg">
                        {React.createElement(variant.Component, {
                          size: 40,
                          primaryColor: '#ffffff',
                          accentColor: '#f97316'
                        })}
                        <div className="flex items-center space-x-1">
                          <span className="text-xl font-medium text-white">FinHub</span>
                          <span className="text-xl font-bold text-orange-500">IQ</span>
                        </div>
                        <span className="ml-auto text-sm text-gray-400">#{index + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}