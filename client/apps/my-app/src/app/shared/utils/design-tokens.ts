/**
 * Design Tokens
 * 
 * TypeScript representation of design tokens for use in Angular components.
 * These tokens match the SCSS design tokens defined in styles/_design-tokens.scss
 */

export const DesignTokens = {
  /**
   * Color Tokens
   */
  colors: {
    // Base Colors
    base: {
      white: '#ffffff',
      black: '#000000',
    },
    
    // Light Theme Colors
    light: {
      primary: '#1976d2',
      primaryDark: '#1565c0',
      primaryLight: '#64b5f6',
      secondary: '#667eea',
      secondaryDark: '#764ba2',
    },
    
    // Dark Theme Colors
    dark: {
      primary: '#64b5f6',
      primaryDark: '#42a5f5',
      primaryLight: '#90caf9',
    },
    
    // Semantic Colors
    semantic: {
      success: '#4caf50',
      successLight: '#81c784',
      successDark: '#388e3c',
      error: '#f44336',
      errorLight: '#e57373',
      errorDark: '#d32f2f',
      warning: '#ffc107',
      warningLight: '#ffd54f',
      warningDark: '#f57c00',
      info: '#17a2b8',
      infoLight: '#5bc0de',
      infoDark: '#138496',
    },
    
    // Light Theme Backgrounds
    lightBackground: {
      primary: '#f8f9fa',
      secondary: '#ffffff',
      card: '#ffffff',
      toolbar: '#3f51b5',
      sidenav: '#ffffff',
      table: '#ffffff',
      tableHeader: '#f5f5f5',
      formField: '#ffffff',
      hover: '#f8f9fa',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    
    // Dark Theme Backgrounds
    darkBackground: {
      primary: '#0d1b2a',
      secondary: '#16213e',
      card: '#16213e',
      toolbar: '#1e3a5f',
      sidenav: '#16213e',
      table: '#16213e',
      tableHeader: '#16213e',
      formField: '#1e3a5f',
      hover: '#1e3a5f',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
    
    // Light Theme Text
    lightText: {
      primary: '#333333',
      secondary: '#666666',
      heading: '#2c3e50',
      white: '#ffffff',
      disabled: '#bdbdbd',
    },
    
    // Dark Theme Text
    darkText: {
      primary: '#e0e0e0',
      secondary: '#bdbdbd',
      heading: '#ffffff',
      white: '#ffffff',
      disabled: '#757575',
    },
    
    // Light Theme Borders
    lightBorder: {
      primary: '#e0e0e0',
      secondary: '#f0f0f0',
      card: '#e9ecef',
      form: '#e0e0e0',
      divider: '#e0e0e0',
    },
    
    // Dark Theme Borders
    darkBorder: {
      primary: '#1e3a5f',
      secondary: '#1e3a5f',
      card: '#1e3a5f',
      form: '#2d4a6b',
      divider: '#1e3a5f',
    },
  },
  
  /**
   * Spacing Tokens
   */
  spacing: {
    base: 4,
    xxs: 4,      // 4px
    xs: 8,       // 8px
    sm: 12,      // 12px
    md: 16,      // 16px
    lg: 24,      // 24px
    xl: 32,      // 32px
    xxl: 48,     // 48px
    xxxl: 64,    // 64px
    
    // Layout Spacing
    headerHeight: 68,
    sidebarWidth: 280,
    sidebarCollapsedWidth: 64,
    containerPadding: 24,
    sectionGap: 32,
  },
  
  /**
   * Typography Tokens
   */
  typography: {
    fontFamily: {
      primary: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo', sans-serif",
      monospace: "'Courier New', Courier, monospace",
    },
    
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      md: '1.125rem',     // 18px
      lg: '1.25rem',      // 20px
      xl: '1.5rem',       // 24px
      xxl: '2rem',        // 32px
      xxxl: '2.5rem',     // 40px
    },
    
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.6,
      loose: 1.8,
    },
    
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.05em',
    },
  },
  
  /**
   * Border Radius Tokens
   */
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  /**
   * Shadow Tokens (as CSS strings)
   */
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 2px 10px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 20px rgba(0, 0, 0, 0.15)',
    xl: '0 8px 30px rgba(0, 0, 0, 0.2)',
    '2xl': '0 12px 40px rgba(0, 0, 0, 0.25)',
    
    // Dark Theme Shadows
    dark: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
      md: '0 2px 10px rgba(0, 0, 0, 0.4)',
      lg: '0 4px 20px rgba(0, 0, 0, 0.5)',
    },
  },
  
  /**
   * Transition & Animation Tokens
   */
  transitions: {
    duration: {
      fast: '0.15s',
      base: '0.3s',
      slow: '0.5s',
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
    animation: {
      fast: '0.2s',
      base: '0.4s',
      slow: '0.6s',
    },
  },
  
  /**
   * Z-Index Tokens
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
  
  /**
   * Breakpoint Tokens
   */
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400,
  },
  
  /**
   * Opacity Tokens
   */
  opacity: {
    disabled: 0.5,
    hover: 0.8,
    overlay: 0.5,
    overlayDark: 0.7,
  },
} as const;

/**
 * Helper function to get CSS variable value
 */
export function getCSSVariable(variableName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
}

/**
 * Helper function to set CSS variable value
 */
export function setCSSVariable(variableName: string, value: string): void {
  document.documentElement.style.setProperty(variableName, value);
}

/**
 * Helper function to get spacing value in pixels
 */
export function getSpacing(multiplier: number): string {
  return `${DesignTokens.spacing.base * multiplier}px`;
}

/**
 * Helper function to check if current theme is dark
 */
export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains('dark-theme');
}
