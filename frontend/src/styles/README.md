# Healthcare Manager - Styles Documentation

## 📁 Styles Structure

```
src/styles/
├── AdminDashboard.css    - Admin-specific dashboard styles
├── AdminPanel.css        - User management panel styles
├── Components.css        - Shared component styles (Navbar, Sidebar, Buttons, etc.)
├── Dashboard.css         - Regular user dashboard styles
└── Login.css            - Login page styles
```

## 🎨 Design System

### Color Palette

#### Primary Colors
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Primary Blue**: `#667eea`
- **Primary Purple**: `#764ba2`

#### Semantic Colors
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)

#### Neutral Colors (Light Mode)
- **Background**: `#f9fafb`
- **Surface**: `#ffffff`
- **Border**: `#e5e7eb`
- **Text Primary**: `#111827`
- **Text Secondary**: `#6b7280`

#### Neutral Colors (Dark Mode)
- **Background**: `#111827`
- **Surface**: `#1f2937`
- **Border**: `#374151`
- **Text Primary**: `#f9fafb`
- **Text Secondary**: `#9ca3af`

### Typography

#### Font Families
- **Primary**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`
- **Monospace**: `source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace`

#### Font Sizes
- **3xl**: `2rem` (32px) - Main headings
- **2xl**: `1.5rem` (24px) - Section headings
- **xl**: `1.25rem` (20px) - Sub-headings
- **lg**: `1.125rem` (18px) - Large text
- **base**: `1rem` (16px) - Body text
- **sm**: `0.875rem` (14px) - Small text
- **xs**: `0.75rem` (12px) - Extra small text

#### Font Weights
- **800**: Extra bold (Headings)
- **700**: Bold (Sub-headings)
- **600**: Semi-bold (Labels)
- **500**: Medium (Body text)
- **400**: Regular (Normal text)

### Spacing Scale

Based on 0.25rem (4px) increments:
- **0.5rem** (8px) - Extra small
- **0.75rem** (12px) - Small
- **1rem** (16px) - Base
- **1.5rem** (24px) - Medium
- **2rem** (32px) - Large
- **3rem** (48px) - Extra large

### Border Radius
- **Small**: `0.5rem` (8px) - Buttons, inputs
- **Medium**: `0.75rem` (12px) - Cards
- **Large**: `1rem` (16px) - Panels
- **XL**: `1.5rem` (24px) - Special cards
- **Full**: `9999px` - Pills, badges

### Shadows

#### Light Mode
- **Small**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- **Medium**: `0 10px 15px -3px rgba(0, 0, 0, 0.15)`
- **Large**: `0 20px 25px -5px rgba(0, 0, 0, 0.25)`
- **Glow**: `0 0 20px rgba(102, 126, 234, 0.3)`

#### Dark Mode
- **Small**: `0 4px 6px -1px rgba(0, 0, 0, 0.3)`
- **Medium**: `0 10px 15px -3px rgba(0, 0, 0, 0.4)`
- **Large**: `0 20px 25px -5px rgba(0, 0, 0, 0.5)`
- **Glow**: `0 0 20px rgba(129, 140, 248, 0.3)`

## 🎭 Animations

### Available Animations
- **fadeIn**: Fade in effect
- **fadeOut**: Fade out effect
- **slideInFromLeft**: Slide from left
- **slideInFromRight**: Slide from right
- **slideInFromTop**: Slide from top
- **slideInFromBottom**: Slide from bottom
- **scaleIn**: Scale up effect
- **pulse**: Pulsing effect
- **bounce**: Bouncing effect
- **spinner**: Loading spinner rotation

### Animation Classes
```css
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.animate-slide-in-left { animation: slideInFromLeft 0.5s ease-out; }
.animate-slide-in-right { animation: slideInFromRight 0.5s ease-out; }
.animate-slide-in-top { animation: slideInFromTop 0.5s ease-out; }
.animate-slide-in-bottom { animation: slideInFromBottom 0.5s ease-out; }
.animate-scale-in { animation: scaleIn 0.3s ease-out; }
```

## 📦 Component Styles

### Buttons
- **Primary**: Gradient background, white text
- **Secondary**: Gray background, dark text
- **Danger**: Red background, white text
- **Action**: Contextual colored buttons

### Cards
- **Standard Card**: White background, rounded corners, shadow
- **Stat Card**: Enhanced with gradient bottom border
- **Interactive Card**: Hover effects with lift and scale

### Forms
- **Input Fields**: Border focus effects, validation states
- **Checkboxes**: Custom styled with accent colors
- **Select Dropdowns**: Consistent styling with inputs

### Tables
- **Header**: Gray background, bold text
- **Rows**: Alternating hover states, smooth transitions
- **Responsive**: Horizontal scroll on mobile

### Modals
- **Overlay**: Backdrop blur effect
- **Content**: Centered, animated entry
- **Header/Footer**: Clear separation with borders

## 🌗 Dark Mode

All components have full dark mode support using the `.dark` class prefix.

### Dark Mode Toggle
Dark mode is controlled globally and persists in localStorage. The theme is applied to the `<html>` element with the `dark` class.

### Dark Mode Variables
All colors have dark mode equivalents defined with `.dark` prefix:
```css
.element { background: white; }
.dark .element { background: #1f2937; }
```

## ♿ Accessibility

### Focus States
- All interactive elements have visible focus indicators
- Focus outline color: `#667eea` (Primary)
- Offset: `2px` for better visibility

### Screen Reader Support
- `.sr-only` class for screen reader only content
- Semantic HTML structure
- ARIA labels where needed

### Keyboard Navigation
- Logical tab order
- Escape key support for modals
- Enter/Space for buttons

### Reduced Motion
Media query support for users who prefer reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  /* Reduced animations */
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1023px`
- **Desktop**: `≥ 1024px`

### Grid Layouts
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

### Sidebar
- Mobile: Overlay with toggle
- Desktop: Fixed, always visible

## 🖨️ Print Styles

Print-specific styles are included:
- Hide navigation elements (`.no-print`)
- Optimize colors for printing
- Adjust layout for paper format

## 🎯 Best Practices

### CSS Organization
1. Component-specific styles in separate files
2. Global utilities in `index.css`
3. Shared components in `Components.css`

### Naming Conventions
- BEM-like structure: `component__element--modifier`
- Descriptive class names
- Avoid overly nested selectors

### Performance
- CSS-in-JS avoided for better performance
- Minimal use of expensive properties
- GPU-accelerated animations

### Maintainability
- Logical grouping of styles
- Comments for complex sections
- Consistent spacing and formatting

## 🔧 Usage Examples

### Import Styles in Components
```javascript
// Not needed - Tailwind handles most styling
// Use custom classes when needed
<div className="admin-dashboard">
  <h1 className="admin-dashboard__title">Title</h1>
</div>
```

### Custom Utility Classes
```html
<div class="text-gradient bg-gradient shadow-glow">
  Beautiful gradients!
</div>
```

### Animation Usage
```html
<div class="animate-fade-in">
  Fades in smoothly
</div>
```

## 📚 Additional Resources

- Tailwind CSS Documentation: https://tailwindcss.com/docs
- CSS Grid Guide: https://css-tricks.com/snippets/css/complete-guide-grid/
- Flexbox Guide: https://css-tricks.com/snippets/css/a-guide-to-flexbox/

---

**Last Updated**: October 30, 2025
**Maintained by**: Healthcare Manager Development Team
