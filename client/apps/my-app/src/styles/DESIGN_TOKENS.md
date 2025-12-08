# Design Tokens Documentation

This document describes the design token system used in the application. Design tokens are the foundational design decisions that define the visual language of the application.

## Overview

Design tokens are centralized values that define colors, spacing, typography, shadows, and other design elements. They ensure consistency across the application and make it easy to maintain and update the design system.

## File Structure

- **`_design-tokens.scss`**: SCSS design tokens (for use in stylesheets)
- **`design-tokens.ts`**: TypeScript design tokens (for use in Angular components)

## Usage

### In SCSS/Component Styles

#### Using CSS Variables (Recommended)

```scss
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-base) var(--easing-ease-in-out);
}
```

#### Using SCSS Variables

```scss
@import 'design-tokens';

.my-component {
  background-color: $color-light-bg-primary;
  color: $color-light-text-primary;
  padding: $spacing-md;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  font-family: $font-family-primary;
}
```

### In TypeScript/Angular Components

```typescript
import { DesignTokens, getCSSVariable } from '@shared/utils/design-tokens';

// Using TypeScript constants
const primaryColor = DesignTokens.colors.light.primary;
const spacing = DesignTokens.spacing.md;

// Using CSS variables dynamically
const bgColor = getCSSVariable('--bg-primary');
const textColor = getCSSVariable('--text-primary');

// In component template
@Component({
  template: `
    <div [style.background-color]="bgColor" 
         [style.padding.px]="spacing">
      Content
    </div>
  `
})
export class MyComponent {
  bgColor = getCSSVariable('--bg-primary');
  spacing = DesignTokens.spacing.md;
}
```

## Token Categories

### Colors

#### Light Theme
- **Primary Colors**: `--color-primary`, `--color-primary-dark`, `--color-primary-light`
- **Background Colors**: `--bg-primary`, `--bg-secondary`, `--bg-card`, `--bg-toolbar`, etc.
- **Text Colors**: `--text-primary`, `--text-secondary`, `--text-heading`, `--text-white`
- **Border Colors**: `--border-primary`, `--border-secondary`, `--border-card`, `--border-form`

#### Dark Theme
All color tokens automatically switch when the `.dark-theme` class is applied to the root element.

#### Semantic Colors
- **Success**: `--color-success` (#4caf50)
- **Error**: `--color-error` (#f44336)
- **Warning**: `--color-warning` (#ffc107)
- **Info**: `--color-info` (#17a2b8)

### Spacing

Spacing tokens follow an 4px base unit system:

- `--spacing-xxs`: 4px
- `--spacing-xs`: 8px
- `--spacing-sm`: 12px
- `--spacing-md`: 16px
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px
- `--spacing-xxl`: 48px
- `--spacing-xxxl`: 64px

**Layout Spacing:**
- `--spacing-header-height`: 64px
- `--spacing-sidebar-width`: 280px
- `--spacing-container-padding`: 24px

### Typography

#### Font Families
- `--font-family-primary`: Noto Sans JP and fallbacks

#### Font Sizes
- `--font-size-xs`: 0.75rem (12px)
- `--font-size-sm`: 0.875rem (14px)
- `--font-size-base`: 1rem (16px)
- `--font-size-md`: 1.125rem (18px)
- `--font-size-lg`: 1.25rem (20px)
- `--font-size-xl`: 1.5rem (24px)
- `--font-size-xxl`: 2rem (32px)
- `--font-size-xxxl`: 2.5rem (40px)

#### Font Weights
- `--font-weight-light`: 300
- `--font-weight-regular`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

#### Line Heights
- `--line-height-tight`: 1.2
- `--line-height-normal`: 1.5
- `--line-height-relaxed`: 1.6
- `--line-height-loose`: 1.8

### Border Radius

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-xl`: 16px
- `--radius-full`: 9999px (fully rounded)

### Shadows

- `--shadow-xs`: Subtle shadow
- `--shadow-sm`: Small shadow
- `--shadow-md`: Medium shadow (default for cards)
- `--shadow-lg`: Large shadow
- `--shadow-xl`: Extra large shadow

Dark theme automatically uses darker shadow variants.

### Transitions

- `--transition-fast`: 0.15s
- `--transition-base`: 0.3s (default)
- `--transition-slow`: 0.5s

Easing functions:
- `--easing-linear`: linear
- `--easing-ease-in`: ease-in
- `--easing-ease-out`: ease-out
- `--easing-ease-in-out`: ease-in-out (default)

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Prefer CSS variables** over SCSS variables for dynamic theming
3. **Use semantic color names** (e.g., `--text-primary`) rather than specific colors
4. **Follow the spacing scale** - use predefined spacing tokens instead of arbitrary values
5. **Use typography tokens** for consistent text styling
6. **Leverage theme-aware tokens** - they automatically adapt to light/dark themes

## Examples

### Card Component

```scss
.card {
  background-color: var(--bg-card);
  color: var(--text-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-card);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base) var(--easing-ease-in-out);
  
  &:hover {
    box-shadow: var(--shadow-lg);
  }
}
```

### Button Component

```scss
.btn {
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-primary);
  color: var(--text-white);
  transition: all var(--transition-base) var(--easing-ease-in-out);
  
  &:hover {
    background-color: var(--color-primary-dark);
    opacity: var(--opacity-hover);
  }
  
  &:disabled {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
  }
}
```

### Responsive Layout

```scss
.container {
  padding: var(--spacing-container-padding);
  max-width: 100%;
  
  @include respond-to(md) {
    max-width: 960px;
  }
  
  @include respond-to(lg) {
    max-width: 1140px;
  }
}
```

## Updating Design Tokens

When updating design tokens:

1. **Update `_design-tokens.scss`** - This is the source of truth
2. **Update `design-tokens.ts`** - Keep TypeScript tokens in sync
3. **Test both themes** - Ensure light and dark themes work correctly
4. **Update documentation** - Keep this file up to date

## Migration Guide

If you have existing styles with hardcoded values:

1. Identify the design decision (color, spacing, etc.)
2. Find the corresponding token in `_design-tokens.scss`
3. Replace hardcoded value with the token
4. Test to ensure visual consistency

Example:
```scss
// Before
.my-component {
  padding: 16px;
  color: #333333;
}

// After
.my-component {
  padding: var(--spacing-md);
  color: var(--text-primary);
}
```
