const { designTokens } = require('./lib/design-tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          50: designTokens.colors.primary[50],
          100: designTokens.colors.primary[100],
          200: designTokens.colors.primary[200],
          300: designTokens.colors.primary[300],
          400: designTokens.colors.primary[400],
          500: designTokens.colors.primary[500], // Primary Orange
          600: designTokens.colors.primary[600], // Orange Dark
          700: designTokens.colors.primary[700],
          800: designTokens.colors.primary[800],
          900: designTokens.colors.primary[900],
        },
        
        // Financial/Professional Colors
        financial: {
          blue: {
            50: designTokens.colors.financial.blue[50],
            100: designTokens.colors.financial.blue[100],
            200: designTokens.colors.financial.blue[200],
            300: designTokens.colors.financial.blue[300],
            400: designTokens.colors.financial.blue[400],
            500: designTokens.colors.financial.blue[500],
            600: designTokens.colors.financial.blue[600], // Financial Blue
            700: designTokens.colors.financial.blue[700],
            800: designTokens.colors.financial.blue[800],
            900: designTokens.colors.financial.blue[900],
          },
          teal: {
            50: designTokens.colors.financial.teal[50],
            100: designTokens.colors.financial.teal[100],
            200: designTokens.colors.financial.teal[200],
            300: designTokens.colors.financial.teal[300],
            400: designTokens.colors.financial.teal[400],
            500: designTokens.colors.financial.teal[500],
            600: designTokens.colors.financial.teal[600], // Tech Teal
            700: designTokens.colors.financial.teal[700],
            800: designTokens.colors.financial.teal[800],
            900: designTokens.colors.financial.teal[900],
          },
        },
        
        // Semantic Colors
        success: {
          50: designTokens.colors.semantic.success[50],
          100: designTokens.colors.semantic.success[100],
          200: designTokens.colors.semantic.success[200],
          300: designTokens.colors.semantic.success[300],
          400: designTokens.colors.semantic.success[400],
          500: designTokens.colors.semantic.success[500],
          600: designTokens.colors.semantic.success[600], // Success Green
          700: designTokens.colors.semantic.success[700],
          800: designTokens.colors.semantic.success[800],
          900: designTokens.colors.semantic.success[900],
        },
        warning: {
          50: designTokens.colors.semantic.warning[50],
          100: designTokens.colors.semantic.warning[100],
          200: designTokens.colors.semantic.warning[200],
          300: designTokens.colors.semantic.warning[300],
          400: designTokens.colors.semantic.warning[400],
          500: designTokens.colors.semantic.warning[500],
          600: designTokens.colors.semantic.warning[600], // Warning Yellow
          700: designTokens.colors.semantic.warning[700],
          800: designTokens.colors.semantic.warning[800],
          900: designTokens.colors.semantic.warning[900],
        },
        error: {
          50: designTokens.colors.semantic.error[50],
          100: designTokens.colors.semantic.error[100],
          200: designTokens.colors.semantic.error[200],
          300: designTokens.colors.semantic.error[300],
          400: designTokens.colors.semantic.error[400],
          500: designTokens.colors.semantic.error[500],
          600: designTokens.colors.semantic.error[600], // Error Red
          700: designTokens.colors.semantic.error[700],
          800: designTokens.colors.semantic.error[800],
          900: designTokens.colors.semantic.error[900],
        },
      },
      
      fontFamily: {
        primary: [designTokens.typography.fontFamily.primary],
        secondary: [designTokens.typography.fontFamily.secondary],
        fallback: [designTokens.typography.fontFamily.fallback],
      },
      
      fontSize: {
        'xs': designTokens.typography.fontSize.xs,
        'sm': designTokens.typography.fontSize.sm,
        'base': designTokens.typography.fontSize.base,
        'lg': designTokens.typography.fontSize.lg,
        'xl': designTokens.typography.fontSize.xl,
        '2xl': designTokens.typography.fontSize['2xl'],
        '3xl': designTokens.typography.fontSize['3xl'],
        '4xl': designTokens.typography.fontSize['4xl'],
        '5xl': designTokens.typography.fontSize['5xl'],
        '6xl': designTokens.typography.fontSize['6xl'],
      },
      
      fontWeight: {
        light: designTokens.typography.fontWeight.light,
        normal: designTokens.typography.fontWeight.normal,
        medium: designTokens.typography.fontWeight.medium,
        semibold: designTokens.typography.fontWeight.semibold,
        bold: designTokens.typography.fontWeight.bold,
        extrabold: designTokens.typography.fontWeight.extrabold,
      },
      
      lineHeight: {
        tight: designTokens.typography.lineHeight.tight,
        normal: designTokens.typography.lineHeight.normal,
        relaxed: designTokens.typography.lineHeight.relaxed,
      },
      
      letterSpacing: {
        tight: designTokens.typography.letterSpacing.tight,
        normal: designTokens.typography.letterSpacing.normal,
        wide: designTokens.typography.letterSpacing.wide,
        wider: designTokens.typography.letterSpacing.wider,
        widest: designTokens.typography.letterSpacing.widest,
      },
      
      spacing: {
        '0': designTokens.spacing[0],
        '1': designTokens.spacing[1],
        '2': designTokens.spacing[2],
        '3': designTokens.spacing[3],
        '4': designTokens.spacing[4],
        '5': designTokens.spacing[5],
        '6': designTokens.spacing[6],
        '8': designTokens.spacing[8],
        '10': designTokens.spacing[10],
        '12': designTokens.spacing[12],
        '16': designTokens.spacing[16],
        '20': designTokens.spacing[20],
        '24': designTokens.spacing[24],
      },
      
      borderRadius: {
        none: designTokens.borderRadius.none,
        sm: designTokens.borderRadius.sm,
        base: designTokens.borderRadius.base,
        md: designTokens.borderRadius.md,
        lg: designTokens.borderRadius.lg,
        xl: designTokens.borderRadius.xl,
        '2xl': designTokens.borderRadius['2xl'],
        '3xl': designTokens.borderRadius['3xl'],
        full: designTokens.borderRadius.full,
      },
      
      boxShadow: {
        sm: designTokens.shadows.sm,
        base: designTokens.shadows.base,
        md: designTokens.shadows.md,
        lg: designTokens.shadows.lg,
        xl: designTokens.shadows.xl,
        '2xl': designTokens.shadows['2xl'],
        inner: designTokens.shadows.inner,
        none: designTokens.shadows.none,
      },
      
      // Custom effects
      dropShadow: {
        'orange-glow': designTokens.effects.glow.orange,
        'blue-glow': designTokens.effects.glow.blue,
        'green-glow': designTokens.effects.glow.green,
      },
      
      // Animation
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    // Custom plugin for FinHubIQ-specific utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-finhub': {
          fontFamily: theme('fontFamily.primary'),
          fontSize: theme('fontSize.2xl'),
          fontWeight: theme('fontWeight.medium'),
          letterSpacing: '0.5px',
        },
        '.text-iq': {
          fontFamily: theme('fontFamily.primary'),
          fontSize: theme('fontSize.3xl'),
          fontWeight: theme('fontWeight.bold'),
          letterSpacing: '1px',
        },
        '.bg-gradient-finhub': {
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
        },
        '.shadow-finhub': {
          boxShadow: '0 0 12px rgba(255, 107, 53, 0.3)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}; 