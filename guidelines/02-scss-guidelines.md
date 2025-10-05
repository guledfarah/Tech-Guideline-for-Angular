# SCSS Styling Guidelines

## Structure and Organization

### ✅ Do: Use BEM Methodology and SCSS Features

```scss
// _button.component.scss
.button {
  &__icon {
    margin-right: 8px;
  }

  &--primary {
    background: $primary-color;
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
```

### ❌ Don't: Use Nested Selectors Deeply

```scss
// Bad: Deep nesting
.dashboard {
  .content {
    .sidebar {
      .navigation {
        .menu {
          .item {
            // This is too deep
          }
        }
      }
    }
  }
}
```

## Mixins and Variables

### ✅ Do: Create Reusable Mixins and variables

```scss
// variables.scss
$spacing-unit: 8px;
$primary-color: #007bff;
$border-radius: 4px;

// mixins.scss
@mixin elevation($level) {
  @if $level == 1 {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  } @else if $level == 2 {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Usage
.card {
  @include elevation(1);
  border-radius: $border-radius;
  padding: $spacing-unit * 2;

  &--elevated {
    @include elevation(2);
  }
}

.icon-button {
  @include flex-center;
  width: $spacing-unit * 4;
  height: $spacing-unit * 4;
}
```

### ❌ Don't: Repeat Values or Use Magic Numbers

```scss
// Bad: Magic numbers and repeated values
.button {
  padding: 12px; // Magic number
  margin-bottom: 15px; // Inconsistent spacing
  box-shadow: 0 3px 6px #00000029; // Hard-coded shadow
}

.card {
  padding: 12px; // Repeated value
  box-shadow: 0 3px 6px #00000029; // Repeated shadow
}
```

## CoreUI Integration

### ✅ Do: Prefer CoreUI standard theming

```scss

```

### ❌ Don't: Override CoreUI Styles Directly

```scss
// Bad: Direct override of CoreUI styles
.mat-button {
  background: blue !important; // Never use !important
  color: white !important;
}
```

## Accessibility

### ✅ Do: Use A11y-Friendly SCSS (if needed)

```scss
// _a11y.scss
@mixin focus-outline {
  outline: 2px solid $focus-color;
  outline-offset: 2px;
}

@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

// Usage
.skip-link {
  @include visually-hidden;

  &:focus {
    position: fixed;
    width: auto;
    height: auto;
    background: $background-color;
    @include focus-outline;
  }
}
```

### ❌ Don't: Remove Focus Outlines Without Alternatives

```scss
// Bad: Removing focus indicators
button:focus {
  outline: none; // Never remove focus without alternative
}

// Bad: Low contrast
.text {
  color: #777; // Poor contrast ratio
}
```

## Responsive Design

### ✅ Do: Use Global Shared Mixins for Breakpoints

```scss
// breakpoints.scss
@mixin respond-to($breakpoint) {
  @if $breakpoint == "small" {
    @media (max-width: 767px) {
      @content;
    }
  } @else if $breakpoint == "medium" {
    @media (min-width: 768px) and (max-width: 1023px) {
      @content;
    }
  } @else if $breakpoint == "large" {
    @media (min-width: 1024px) {
      @content;
    }
  }
}

// Usage
.container {
  padding: $spacing-unit;

  @include respond-to("small") {
    padding: $spacing-unit / 2;
  }

  @include respond-to("large") {
    padding: $spacing-unit * 2;
  }
}
```

### ❌ Don't: Use Hard-Coded Media Queries

```scss
// Bad: Hard-coded breakpoints
.container {
  padding: 16px;

  @media (max-width: 760px) {
    // Inconsistent breakpoint
    padding: 8px;
  }
}
```

## Performance

### ✅ Do: Use CSS Properties for Dynamic Values

```scss
.theme-container {
  --primary-color: #{$primary-color};
  --text-color: #{$text-color};

  .button {
    background: var(--primary-color);
    color: var(--text-color);
  }
}
```

### ❌ Don't: Generate Excessive CSS

```scss
// Bad: Generating too many classes
@for $i from 1 through 100 {
  .margin-#{$i} {
    margin: #{$i}px;
  }
  .padding-#{$i} {
    padding: #{$i}px;
  }
}
```
