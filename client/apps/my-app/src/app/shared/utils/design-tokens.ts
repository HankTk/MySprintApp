/**
 * Design Tokens
 *
 * TypeScript representation of design tokens for use in Angular components.
 * These tokens read from CSS variables defined in _design-tokens.scss,
 * avoiding hard-coded color values and ensuring single source of truth.
 *
 * All color values are read dynamically from CSS variables at runtime,
 * so they automatically adapt to the current theme (light/dark).
 */

/**
 * CSS Variable Names
 * These constants define the CSS variable names used in the design system.
 * The actual values are defined in _design-tokens.scss and read at runtime.
 */
export const CSSVariables =
    {
      // Color Variables
      colorPrimary: '--color-primary',
      colorPrimaryDark: '--color-primary-dark',
      colorPrimaryLight: '--color-primary-light',
      colorSecondary: '--color-secondary',
      colorSuccess: '--color-success',
      colorError: '--color-error',
      colorWarning: '--color-warning',
      colorInfo: '--color-info',

      // Background Variables
      bgPrimary: '--bg-primary',
      bgSecondary: '--bg-secondary',
      bgCard: '--bg-card',
      bgToolbar: '--bg-toolbar',
      bgSidenav: '--bg-sidenav',
      bgTable: '--bg-table',
      bgTableHeader: '--bg-table-header',
      bgFormField: '--bg-form-field',
      bgHover: '--bg-hover',
      bgOverlay: '--bg-overlay',

      // Text Variables
      textPrimary: '--text-primary',
      textSecondary: '--text-secondary',
      textHeading: '--text-heading',
      textWhite: '--text-white',
      textDisabled: '--text-disabled',

      // Border Variables
      borderPrimary: '--border-primary',
      borderSecondary: '--border-secondary',
      borderCard: '--border-card',
      borderForm: '--border-form',
      borderDivider: '--border-divider',

      // Shadow Variables
      shadowXs: '--shadow-xs',
      shadowSm: '--shadow-sm',
      shadowMd: '--shadow-md',
      shadowLg: '--shadow-lg',
      shadowXl: '--shadow-xl',

      // Transition Variables
      transitionFast: '--transition-fast',
      transitionBase: '--transition-base',
      transitionSlow: '--transition-slow',
    } as const;

/**
 * Design Tokens Object
 * Provides getter functions that read from CSS variables dynamically.
 * This ensures values are always in sync with the current theme.
 */
export const DesignTokens =
    {
      /**
       * Color Tokens - Read from CSS variables
       */
      colors: {
        // Get current theme colors (automatically adapts to light/dark)
        get primary()
        {
          return getCSSVariable(CSSVariables.colorPrimary);
        },
        get primaryDark()
        {
          return getCSSVariable(CSSVariables.colorPrimaryDark);
        },
        get primaryLight()
        {
          return getCSSVariable(CSSVariables.colorPrimaryLight);
        },
        get secondary()
        {
          return getCSSVariable(CSSVariables.colorSecondary);
        },
        get success()
        {
          return getCSSVariable(CSSVariables.colorSuccess);
        },
        get error()
        {
          return getCSSVariable(CSSVariables.colorError);
        },
        get warning()
        {
          return getCSSVariable(CSSVariables.colorWarning);
        },
        get info()
        {
          return getCSSVariable(CSSVariables.colorInfo);
        }
      },

      /**
       * Background Tokens - Read from CSS variables
       */
      backgrounds: {
        get primary()
        {
          return getCSSVariable(CSSVariables.bgPrimary);
        },
        get secondary()
        {
          return getCSSVariable(CSSVariables.bgSecondary);
        },
        get card()
        {
          return getCSSVariable(CSSVariables.bgCard);
        },
        get toolbar()
        {
          return getCSSVariable(CSSVariables.bgToolbar);
        },
        get sidenav()
        {
          return getCSSVariable(CSSVariables.bgSidenav);
        },
        get table()
        {
          return getCSSVariable(CSSVariables.bgTable);
        },
        get tableHeader()
        {
          return getCSSVariable(CSSVariables.bgTableHeader);
        },
        get formField()
        {
          return getCSSVariable(CSSVariables.bgFormField);
        },
        get hover()
        {
          return getCSSVariable(CSSVariables.bgHover);
        },
        get overlay()
        {
          return getCSSVariable(CSSVariables.bgOverlay);
        }
      },

      /**
       * Text Tokens - Read from CSS variables
       */
      text: {
        get primary()
        {
          return getCSSVariable(CSSVariables.textPrimary);
        },
        get secondary()
        {
          return getCSSVariable(CSSVariables.textSecondary);
        },
        get heading()
        {
          return getCSSVariable(CSSVariables.textHeading);
        },
        get white()
        {
          return getCSSVariable(CSSVariables.textWhite);
        },
        get disabled()
        {
          return getCSSVariable(CSSVariables.textDisabled);
        }
      },

      /**
       * Border Tokens - Read from CSS variables
       */
      borders: {
        get primary()
        {
          return getCSSVariable(CSSVariables.borderPrimary);
        },
        get secondary()
        {
          return getCSSVariable(CSSVariables.borderSecondary);
        },
        get card()
        {
          return getCSSVariable(CSSVariables.borderCard);
        },
        get form()
        {
          return getCSSVariable(CSSVariables.borderForm);
        },
        get divider()
        {
          return getCSSVariable(CSSVariables.borderDivider);
        }
      },

      /**
       * Spacing Tokens
       * These are numeric values used for calculations, so they remain as constants.
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
        headerHeight: 70,
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
       * Shadow Tokens - Read from CSS variables
       */
      shadows: {
        get xs()
        {
          return getCSSVariable(CSSVariables.shadowXs);
        },
        get sm()
        {
          return getCSSVariable(CSSVariables.shadowSm);
        },
        get md()
        {
          return getCSSVariable(CSSVariables.shadowMd);
        },
        get lg()
        {
          return getCSSVariable(CSSVariables.shadowLg);
        },
        get xl()
        {
          return getCSSVariable(CSSVariables.shadowXl);
        }
      },

      /**
       * Transition & Animation Tokens
       */
      transitions: {
        duration: {
          get fast()
          {
            return getCSSVariable(CSSVariables.transitionFast);
          },
          get base()
          {
            return getCSSVariable(CSSVariables.transitionBase);
          },
          get slow()
          {
            return getCSSVariable(CSSVariables.transitionSlow);
          }
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
export function getCSSVariable(variableName: string): string
{
  return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
}

/**
 * Helper function to set CSS variable value
 */
export function setCSSVariable(variableName: string, value: string): void
{
  document.documentElement.style.setProperty(variableName, value);
}

/**
 * Helper function to get spacing value in pixels
 */
export function getSpacing(multiplier: number): string
{
  return `${DesignTokens.spacing.base * multiplier}px`;
}

/**
 * Helper function to check if current theme is dark
 */
export function isDarkTheme(): boolean
{
  return document.documentElement.classList.contains('dark-theme');
}
