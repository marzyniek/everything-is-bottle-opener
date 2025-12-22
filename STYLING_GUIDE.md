# Centralized Styling Guide

This project now includes centralized CSS files to make styling more consistent and easier to use across the application.

## Files Added

### `src/app/style.css`
A regular CSS file with reusable utility classes for common styling patterns. This file is ready to use and is imported into `globals.css`.

### `src/app/style.scss`
A SCSS (Sass) version with variables, mixins, and nested selectors for more advanced styling. 

**Note:** To use SCSS, you need to install the `sass` package:
```bash
npm install --save-dev sass
```

Then update `globals.css` to import the SCSS file instead:
```css
@import "./style.scss";
```

## Available Classes

### Layout & Containers
- `.container-centered` - Centered container with max-width of 1024px
- `.container-centered-wide` - Wide centered container with max-width of 1536px
- `.page-container` - Full page container with dark background

### Headers
- `.header-section` - Centered header section with bottom border
- `.header-title` - Large title with gradient effect (blue to green)
- `.header-subtitle` - Subtitle with muted gray color

### Buttons
- `.btn-primary` - Blue primary button
- `.btn-success` - Green success button
- `.btn-danger` - Red danger/delete button
- `.btn-secondary` - Gray secondary button
- `.btn-purple` - Purple accent button
- All buttons include base styles and support `:disabled` state

### Cards
- `.card` - Basic card with dark background and border
- `.card-content` - Padded content area inside card
- `.card-gradient-blue` - Card with blue gradient background
- `.card-gradient-green` - Card with green gradient background

### Forms
- `.form-input` - Styled input field with focus state
- `.form-label` - Label for form inputs
- `.form-group` - Wrapper for form field with spacing

### Grid Layouts
- `.grid-2-cols` - Responsive 2-column grid (1 col on mobile, 2 on tablet+)
- `.grid-3-cols` - Responsive 3-column grid (1 col mobile, 2 tablet, 3 desktop)

### Video
- `.video-container` - 16:9 aspect ratio video container

### Text Utilities
- `.text-gradient` - Gradient text (blue to green)
- `.text-muted` - Muted gray text
- `.text-error` - Red error text
- `.text-success` - Green success text

### Spacing
- `.section-spacing` - Top margin for sections
- `.content-spacing` - Top margin for content

### Special Components
- `.vote-button` - Base vote button styling
- `.vote-button-neutral` - Neutral vote button
- `.vote-button-upvote` - Green upvote button
- `.vote-button-downvote` - Red downvote button
- `.vote-count` - Vote count display
- `.stat-card` - Large statistic number
- `.stat-label` - Label for statistics

### Effects
- `.hover-lift` - Lift effect on hover

## Usage Examples

### Using Centered Layout
```tsx
<main className="page-container">
  <div className="container-centered">
    {/* Your content */}
  </div>
</main>
```

### Using Header Styles
```tsx
<header className="header-section">
  <h1 className="header-title">Your Title</h1>
  <p className="header-subtitle">Your subtitle</p>
</header>
```

### Using Button Styles
```tsx
<button className="btn-primary">Click Me</button>
<button className="btn-success">Save</button>
<button className="btn-danger">Delete</button>
```

### Using Card Styles
```tsx
<div className="card">
  <div className="card-content">
    {/* Card content */}
  </div>
</div>
```

### Using Grid Layouts
```tsx
<div className="grid-2-cols">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

### Mixing with Tailwind
You can still use Tailwind classes alongside these centralized classes:
```tsx
<button className="btn-primary mt-4 flex items-center gap-2">
  Click Me
</button>
```

## SCSS Features (when sass is installed)

The SCSS file includes:
- **Variables** for colors, spacing, border radius, and breakpoints
- **Mixins** for common patterns (transitions, flex-center, gradient-text, etc.)
- **Nested selectors** for better organization
- **Extends** to reduce code duplication

## Benefits

1. **Consistency** - Reusable classes ensure consistent styling across the app
2. **Maintainability** - Changes to common patterns can be made in one place
3. **Readability** - Semantic class names make the HTML more readable
4. **Performance** - Reduced CSS duplication
5. **Flexibility** - Can still use Tailwind for one-off styling needs
