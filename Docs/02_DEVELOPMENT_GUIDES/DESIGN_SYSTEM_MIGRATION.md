# 🔄 Design System Migration Guide

**Version**: 1.0.0  
**Created**: January 17, 2026

---

## Overview

This guide explains how to migrate from the legacy `tm-*` color classes to the new design system.

## Quick Reference

### Color Migration Table

| Legacy Class                | New Class                  | Notes               |
| --------------------------- | -------------------------- | ------------------- |
| `bg-tm-primary`             | `bg-primary-600`           | Main primary color  |
| `bg-tm-primary-hover`       | `bg-primary-700`           | Primary hover state |
| `hover:bg-tm-primary-hover` | `hover:bg-primary-700`     | Hover variant       |
| `text-tm-primary`           | `text-primary-600`         | Primary text        |
| `ring-tm-accent`            | `ring-primary-500`         | Focus ring          |
| `focus:ring-tm-accent`      | `focus:ring-primary-500`   | Focus ring          |
| `focus:border-tm-accent`    | `focus:border-primary-500` | Focus border        |
| `bg-tm-light`               | `bg-gray-50`               | Light background    |
| `text-tm-dark`              | `text-gray-900`            | Dark text           |
| `text-tm-secondary`         | `text-secondary-500`       | Secondary text      |

### Status Colors

| Legacy       | New              | Usage              |
| ------------ | ---------------- | ------------------ |
| `bg-success` | `bg-success-600` | Success background |
| `bg-danger`  | `bg-danger-600`  | Danger background  |
| `bg-warning` | `bg-warning-500` | Warning background |
| `bg-info`    | `bg-info-600`    | Info background    |

---

## Using New Components

Instead of manually specifying classes, use the new component library:

### Before (Legacy)

```tsx
<button className="px-4 py-2 bg-tm-primary text-white rounded-lg hover:bg-tm-primary-hover">
  Save
</button>
```

### After (Using Component)

```tsx
import { Button } from "@components/ui";

<Button variant="primary" size="md">
  Save
</Button>;
```

### Form Inputs

```tsx
// Before
<input className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-tm-accent" />;

// After
import { Input } from "@components/ui";

<Input label="Name" placeholder="Enter name" />;
```

### Cards

```tsx
// Before
<div className="bg-white rounded-lg shadow-md p-4">...</div>;

// After
import { Card } from "@components/ui";

<Card padding="md">...</Card>;
```

---

## Step-by-Step Migration

### 1. File-by-File Approach

For each component file:

1. Import new components from `@components/ui`
2. Replace inline class strings with component usage
3. Test component renders correctly
4. Commit changes

### 2. Search & Replace

Use VS Code search to find legacy classes:

```
Search: bg-tm-primary(?!-hover)
Replace: bg-primary-600

Search: bg-tm-primary-hover
Replace: bg-primary-700

Search: text-tm-primary
Replace: text-primary-600

Search: ring-tm-accent
Replace: ring-primary-500

Search: border-tm-accent
Replace: border-primary-500
```

### 3. Verify No Broken Classes

After migration, search for any remaining `tm-` references:

```bash
grep -r "tm-" src/
```

---

## Backward Compatibility

The following aliases are added to `tailwind.config.js` for backward compatibility:

```javascript
colors: {
  "tm-primary": "#2563eb",
  "tm-primary-hover": "#1d4ed8",
  "tm-accent": "#3b82f6",
  "tm-secondary": "#64748b",
  "tm-light": "#f9fafb",
  "tm-dark": "#111827",
}
```

These aliases allow the application to continue working while migration is in progress.

---

## CSS Utility Classes

The following CSS utility classes are available in `index.css`:

```css
/* Buttons */
.btn-primary    /* Primary action button */
.btn-secondary  /* Secondary action button */
.btn-destructive /* Dangerous action button */
.btn-ghost      /* Low emphasis button */

/* Inputs */
.input-base     /* Standard form input */

/* Cards */
.card           /* Basic card */
.card-elevated  /* Card with shadow */
.card-interactive /* Clickable card */

/* Other */
.badge          /* Small label */
.label          /* Form label */
.link           /* Text link */
.divider        /* Horizontal divider */
```

---

## Testing Checklist

After migration, verify:

- [ ] All buttons render correctly
- [ ] Form inputs show proper focus states
- [ ] Cards display with correct shadows
- [ ] Badge colors are correct
- [ ] Hover states work properly
- [ ] Focus indicators are visible
- [ ] Dark mode works (if applicable)
- [ ] No console errors
- [ ] Visual regression check passes

---

## Need Help?

Refer to:

- [Component Library Documentation](./src/components/ui/COMPONENT_LIBRARY.md)
- [Design System Guide](./Docs/03_STANDARDS_AND_PROCEDURES/DESIGN_SYSTEM.md)
- [Design Tokens](./Docs/03_STANDARDS_AND_PROCEDURES/DESIGN_TOKENS.md)
