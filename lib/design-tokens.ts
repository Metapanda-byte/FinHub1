// FinHubIQ Design Tokens
// Generated from Figma design system

export const designTokens = {
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#FF6B35', // Primary Orange
      600: '#E55A2B', // Orange Dark
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },
    
    // Financial/Professional Colors
    financial: {
      blue: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6',
        600: '#1E3A8A', // Financial Blue
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
      },
      teal: {
        50: '#F0FDFA',
        100: '#CCFBF1',
        200: '#99F6E4',
        300: '#5EEAD4',
        400: '#2DD4BF',
        500: '#14B8A6',
        600: '#0F766E', // Tech Teal
        700: '#0F766E',
        800: '#115E59',
        900: '#134E4A',
      },
    },
    
    // Semantic Colors
    semantic: {
      success: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        200: '#BBF7D0',
        300: '#86EFAC',
        400: '#4ADE80',
        500: '#22C55E',
        600: '#059669', // Success Green
        700: '#15803D',
        800: '#166534',
        900: '#14532D',
      },
      warning: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F59E0B',
        600: '#D97706', // Warning Yellow
        700: '#B45309',
        800: '#92400E',
        900: '#78350F',
      },
      error: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444',
        600: '#DC2626', // Error Red
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D',
      },
    },
    
    // Neutral Colors
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      white: '#FFFFFF',
      black: '#000000',
    },
  },
  
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'SF Pro Display, system-ui, sans-serif',
      fallback: 'Roboto, system-ui, sans-serif',
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',  // 2px
    base: '0.25rem', // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  
  effects: {
    glow: {
      orange: '0 0 12px rgba(255, 107, 53, 0.3)',
      blue: '0 0 12px rgba(59, 130, 246, 0.3)',
      green: '0 0 12px rgba(34, 197, 94, 0.3)',
    },
  },
};

// CSS Custom Properties for use in components
export const cssVariables = {
  '--color-primary-500': designTokens.colors.primary[500],
  '--color-primary-600': designTokens.colors.primary[600],
  '--color-financial-blue-600': designTokens.colors.financial.blue[600],
  '--color-financial-teal-600': designTokens.colors.financial.teal[600],
  '--color-semantic-success-600': designTokens.colors.semantic.success[600],
  '--color-semantic-warning-600': designTokens.colors.semantic.warning[600],
  '--color-semantic-error-600': designTokens.colors.semantic.error[600],
  '--color-neutral-white': designTokens.colors.neutral.white,
  '--color-neutral-black': designTokens.colors.neutral.black,
  '--font-family-primary': designTokens.typography.fontFamily.primary,
  '--font-size-base': designTokens.typography.fontSize.base,
  '--font-weight-medium': designTokens.typography.fontWeight.medium,
  '--font-weight-bold': designTokens.typography.fontWeight.bold,
  '--border-radius-base': designTokens.borderRadius.base,
  '--shadow-base': designTokens.shadows.base,
  '--shadow-lg': designTokens.shadows.lg,
  '--effect-glow-orange': designTokens.effects.glow.orange,
};

// Utility function to apply design tokens to CSS
export function applyDesignTokens(element: HTMLElement) {
  Object.entries(cssVariables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

// Logo-specific design tokens
export const logoTokens = {
  colors: {
    primary: designTokens.colors.primary[500],
    white: designTokens.colors.neutral.white,
    black: designTokens.colors.neutral.black,
  },
  typography: {
    finhub: {
      fontFamily: designTokens.typography.fontFamily.primary,
      fontSize: designTokens.typography.fontSize['2xl'],
      fontWeight: designTokens.typography.fontWeight.medium,
      letterSpacing: '0.5px',
    },
    iq: {
      fontFamily: designTokens.typography.fontFamily.primary,
      fontSize: designTokens.typography.fontSize['3xl'],
      fontWeight: designTokens.typography.fontWeight.bold,
      letterSpacing: '1px',
    },
  },
  spacing: {
    graphicSpacing: '12px',
    textSpacing: '8px',
  },
  effects: {
    shadow: designTokens.shadows.sm,
    glow: designTokens.effects.glow.orange,
  },
};

export default designTokens; 