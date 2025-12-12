# UI Component Library

A shared Angular component library for common UI components used across the application.

## Components

### AxButtonComponent (`ax-button`)

A reusable button component with loading state support.

**Usage:**
```html
<ax-button color="primary" variant="raised" [loading]="isLoading">
  Click Me
</ax-button>
```

**Inputs:**
- `type`: `'button' | 'submit' | 'reset'` - Button type (default: `'button'`)
- `color`: `'primary' | 'accent' | 'warn'` - Button color (default: `'primary'`)
- `variant`: `'raised' | 'flat' | 'stroked' | 'icon'` - Button variant (default: `'raised'`)
- `disabled`: `boolean` - Disabled state (default: `false`)
- `loading`: `boolean` - Loading state (default: `false`)

### AxCardComponent (`ax-card`)

A reusable card component with title and subtitle support.

**Usage:**
```html
<ax-card title="Card Title" subtitle="Card Subtitle" [elevation]="2">
  Card content goes here
</ax-card>
```

**Inputs:**
- `title`: `string` - Card title (optional)
- `subtitle`: `string` - Card subtitle (optional)
- `elevation`: `number` - Card elevation (default: `1`)

### AxInputComponent (`ax-input`)

A reusable input component with form integration support.

**Usage:**
```html
<ax-input
  label="Email"
  type="email"
  placeholder="Enter your email"
  [required]="true"
  [(ngModel)]="email">
</ax-input>
```

**Inputs:**
- `label`: `string` - Input label (optional)
- `placeholder`: `string` - Input placeholder (optional)
- `type`: `string` - Input type (default: `'text'`)
- `required`: `boolean` - Required state (default: `false`)
- `disabled`: `boolean` - Disabled state (default: `false`)
- `error`: `string` - Error message (optional)
- `hint`: `string` - Hint text (optional)

### AxTableComponent (`ax-table`)

A reusable table component with sorting and pagination support.

**Usage:**
```html
<ax-table
  [dataSource]="data"
  [displayedColumns]="['name', 'email', 'status']"
  [pageSize]="10"
  [showPaginator]="true"
  [showSort]="true">
</ax-table>
```

**Inputs:**
- `dataSource`: `T[]` - Table data source
- `displayedColumns`: `string[]` - Column definitions
- `pageSize`: `number` - Items per page (default: `10`)
- `pageSizeOptions`: `number[]` - Page size options (default: `[5, 10, 25, 100]`)
- `showPaginator`: `boolean` - Show paginator (default: `true`)
- `showSort`: `boolean` - Enable sorting (default: `true`)

### AxDialogComponent (`ax-dialog`)

A reusable dialog component.

**Usage:**
```html
<ax-dialog
  title="Dialog Title"
  [width]="'600px'"
  [showCloseButton]="true"
  (close)="onClose()">
  Dialog content
</ax-dialog>
```

**Inputs:**
- `title`: `string` - Dialog title (optional)
- `width`: `string` - Dialog width (default: `'500px'`)
- `showCloseButton`: `boolean` - Show close button (default: `true`)

**Outputs:**
- `close`: `EventEmitter<void>` - Emitted when dialog is closed

## Installation

The library is already configured in the workspace. Import components using:

```typescript
import { AxButtonComponent, AxCardComponent, AxInputComponent, AxTableComponent, AxDialogComponent } from '@ui/components';
```

## Development

To build the library:

```bash
nx build ui
```

To test the library:

```bash
nx test ui
```
