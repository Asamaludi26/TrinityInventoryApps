# 🎨 Trinity Component Library - Design System Implementation

**Version**: 1.0.0  
**Last Updated**: January 17, 2026  
**Status**: ✅ Complete & Production Ready

---

## 📚 Overview

This is the unified component library for Trinity Inventory Apps frontend. All components follow the design system defined in `Docs/03_STANDARDS_AND_PROCEDURES/DESIGN_SYSTEM.md` and use Tailwind CSS with design tokens.

### Key Principles

1. **Consistency**: All components follow the same design patterns and API
2. **Accessibility**: WCAG AA compliance with semantic HTML and ARIA attributes
3. **Composability**: Components can be combined to create complex UIs
4. **Type Safety**: Full TypeScript support with proper prop interfaces
5. **Responsive**: Mobile-first design with proper breakpoints
6. **Dark Mode Ready**: All components support dark mode via `dark:` classes

---

## 🎯 Component Categories

### 1. Core/Atomic Components

These are the foundational components that everything else builds upon.

#### Button

```tsx
import { Button } from '@components/ui';

// Variants: primary, secondary, outline, destructive, ghost
<Button variant="primary" size="md">Save</Button>
<Button variant="destructive" size="sm">Delete</Button>

// With icon
<Button icon={<IconComponent />} iconPosition="left">
  Click me
</Button>

// Loading state
<Button isLoading>Processing...</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

**Props:**

- `variant`: primary | secondary | outline | destructive | ghost
- `size`: xs | sm | md | lg | xl
- `isLoading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean
- `icon`: ReactNode
- `iconPosition`: left | right

#### Input

```tsx
import { Input } from '@components/ui';

// Basic
<Input placeholder="Enter text" />

// With label and error
<Input
  label="Email"
  type="email"
  error="Invalid email format"
  required
/>

// With success state
<Input
  success
  value="example@example.com"
/>

// With helper text
<Input
  label="Password"
  type="password"
  helperText="Must be at least 8 characters"
/>
```

**Props:**

- `type`: text | email | password | number | tel | url | search | date | time
- `label`: string
- `error`: string
- `success`: boolean
- `disabled`: boolean
- `required`: boolean
- `size`: sm | md | lg
- `variant`: default | filled | flushed
- `icon`: ReactNode
- `iconPosition`: left | right
- `helperText`: string

#### Text

```tsx
import { Text } from '@components/ui';

// Semantic headings
<Text as="h1">Main Title</Text>
<Text as="h2" size="h2">Subtitle</Text>

// Body text
<Text>Regular paragraph</Text>
<Text size="bodySmall" color="muted">Small text</Text>

// Formatted text
<Text weight="semibold">Bold text</Text>
<Text color="primary">Colored text</Text>

// Multi-line truncation
<Text truncate>Long text will be truncated with ellipsis</Text>
<Text lineClamp={3}>Max 3 lines of text</Text>
```

**Props:**

- `as`: h1-h6 | p | span | label | div
- `size`: h1-h6 | body | bodyLarge | bodySmall | caption | label | code
- `weight`: normal | medium | semibold | bold
- `color`: default | muted | primary | success | warning | danger | info | light
- `align`: left | center | right | justify
- `truncate`: boolean
- `lineClamp`: number

#### Badge

```tsx
import { Badge } from '@components/ui';

// Basic variants
<Badge variant="primary">Label</Badge>
<Badge variant="success">Approved</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Error</Badge>

// With icon
<Badge icon={<CheckIcon />} iconPosition="left">
  Completed
</Badge>

// With dot indicator
<Badge dot variant="success">Active</Badge>

// Dismissible
<Badge
  dismissible
  onDismiss={() => console.log('dismissed')}
>
  Removable
</Badge>
```

**Props:**

- `variant`: primary | success | warning | danger | info | neutral
- `size`: sm | md | lg
- `rounded`: full | lg | md
- `icon`: ReactNode
- `iconPosition`: left | right
- `dismissible`: boolean
- `onDismiss`: () => void
- `dot`: boolean

---

### 2. Layout Components

#### Card

```tsx
import { Card } from '@components/ui';

// Simple card
<Card>
  <p>Simple content</p>
</Card>

// Compound card
<Card variant="elevated">
  <Card.Header
    title="Card Title"
    action={<Button size="sm">Action</Button>}
  />
  <Card.Body>
    <p>Main content goes here</p>
  </Card.Body>
  <Card.Footer>
    <Button variant="secondary">Cancel</Button>
    <Button>Save</Button>
  </Card.Footer>
</Card>
```

**Props:**

- `variant`: default | elevated | outlined | filled
- `interactive`: boolean
- `padding`: none | sm | md | lg
- `clickable`: boolean

---

### 3. Design System Utilities

#### Using Design System Utils

```tsx
import {
  textStyles,
  cardStyles,
  badgeStyles,
  inputStyles,
  shadows,
  spacing
} from '@utils/designSystem';

// Direct style usage
<div className={textStyles.h1}>Large Heading</div>
<div className={cardStyles.base}>Card content</div>
<span className={badgeStyles.primary}>Badge</span>

// Responsive grids
import { gridColumns } from '@utils/designSystem';
<div className={gridColumns({ mobile: 1, tablet: 2, desktop: 4 })}>
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

---

## 🎨 Design Tokens Reference

### Color Palette

**Primary Colors** (Brand Blue)

```
primary-50: #eff6ff    (Light background)
primary-100: #dbeafe  (Subtle highlight)
primary-500: #3b82f6  (Main primary)
primary-600: #2563eb  (Primary hover)
primary-700: #1d4ed8  (Primary active)
```

**Semantic Colors**

```
Success: #22c55e   (Green)
Warning: #f59e0b   (Amber)
Danger: #ef4444    (Red)
Info: #06b6d4      (Cyan)
```

**Neutral Colors**

```
Gray-50: #f9fafb   (Light background)
Gray-900: #111827  (Dark text)
```

### Typography Scale

```
h1: 36px, bold
h2: 30px, bold
h3: 24px, semibold
h4: 20px, semibold
h5: 18px, semibold

Body: 14px, regular
Body Large: 16px, regular
Body Small: 12px, regular

Caption: 12px, medium, uppercase
```

### Spacing Scale

Follows Tailwind spacing with additions:

```
0 → 0px
1 → 0.25rem (4px)
2 → 0.5rem (8px)
3 → 0.75rem (12px)
4 → 1rem (16px)
6 → 1.5rem (24px)
8 → 2rem (32px)
```

### Shadows

```
soft: 0 2px 15px -3px rgba(0,0,0,0.07)
card: 0 1px 3px 0 rgba(0,0,0,0.1)
dropdown: 0 4px 6px -1px rgba(0,0,0,0.1)
```

---

## 📋 Usage Patterns

### Pattern 1: Form

```tsx
<Card padding="md">
  <Card.Header title="User Registration" />
  <Card.Body>
    <Input label="Name" placeholder="John Doe" required />
    <Input label="Email" type="email" required />
    <Input label="Password" type="password" required />
  </Card.Body>
  <Card.Footer>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Register</Button>
  </Card.Footer>
</Card>
```

### Pattern 2: List Item

```tsx
<Card interactive padding="md" className="flex items-center justify-between">
  <div>
    <Text weight="semibold">Item Name</Text>
    <Text size="bodySmall" color="muted">
      Sub details
    </Text>
  </div>
  <Badge variant="success">Active</Badge>
</Card>
```

### Pattern 3: Alert/Message

```tsx
<Card variant="outlined" className="border-l-4 border-l-warning-500">
  <div className="flex gap-3">
    <WarningIcon className="w-5 h-5 text-warning-500 flex-shrink-0" />
    <div>
      <Text weight="semibold" color="warning">
        Warning
      </Text>
      <Text size="bodySmall">This action cannot be undone.</Text>
    </div>
  </div>
</Card>
```

---

## ♿ Accessibility

All components follow WCAG AA standards:

✅ **Semantic HTML** - Proper element types  
✅ **ARIA Labels** - Interactive elements are labeled  
✅ **Keyboard Navigation** - All interactive elements work with keyboard  
✅ **Focus States** - Visible focus indicators on all elements  
✅ **Color Contrast** - Text meets minimum contrast ratios  
✅ **Form Validation** - Proper error messages and hints

### Example with ARIA

```tsx
<Button aria-label="Save changes">
  <SaveIcon />
</Button>

<Input
  id="email"
  aria-describedby="email-hint"
  aria-required="true"
/>
<span id="email-hint">Your primary email address</span>
```

---

## 🚀 Best Practices

### DO ✅

- Use the component library components instead of raw HTML
- Apply design tokens for colors and spacing
- Test components with keyboard navigation
- Use semantic HTML elements
- Keep component props minimal and well-documented
- Use TypeScript for prop validation

### DON'T ❌

- Hardcode colors directly in className
- Mix multiple styling approaches in one component
- Use inline styles instead of Tailwind classes
- Forget to test dark mode
- Create duplicate components with same functionality
- Use `any` type in component props

---

## 🔄 Migration Guide

### Before (Legacy)

```tsx
<div className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click me
</div>
```

### After (Using Library)

```tsx
<Button variant="primary" size="md">
  Click me
</Button>
```

### Color System Migration

```tsx
// ❌ Old (hardcoded)
className = "bg-tm-primary text-white";

// ✅ New (using Tailwind + design tokens)
className = "bg-primary-600 text-white dark:bg-primary-500";
```

---

## 📚 Additional Resources

- [Design System Guide](../../Docs/03_STANDARDS_AND_PROCEDURES/DESIGN_SYSTEM.md)
- [Design Tokens](../../Docs/03_STANDARDS_AND_PROCEDURES/DESIGN_TOKENS.md)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Component API Spec](../../Docs/03_STANDARDS_AND_PROCEDURES/COMPONENT_API_SPEC.md)

---

## 🎓 Learning Resources

- React Component Patterns: [https://www.patterns.dev/posts/compound-pattern/](https://www.patterns.dev/posts/compound-pattern/)
- WCAG Accessibility: [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/)
- Tailwind CSS: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
