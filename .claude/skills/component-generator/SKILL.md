---
name: component-generator
description: Generate React components following project conventions. Use this skill when creating new UI components for the portfolio. Creates TypeScript components with CSS Modules, proper typing, and test files.
allowed-tools: Read, Write, Edit, Bash(make test), Bash(make lint)
---

# React Component Generator

Create components that follow this project's conventions and patterns.

## Component Structure

Each component needs three files:

```
src/components/
├── ComponentName.tsx         # Component implementation
├── ComponentName.module.css  # Scoped styles
└── __tests__/
    └── ComponentName.test.tsx  # Tests
```

## Component Template

### TypeScript Component (`ComponentName.tsx`)

```tsx
import React from 'react'
import * as styles from './ComponentName.module.css'

interface ComponentNameProps {
  // Define props here
  title: string
  onClick?: () => void
  children?: React.ReactNode
}

const ComponentName = ({ title, onClick, children }: ComponentNameProps) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      {children}
      {onClick && (
        <button onClick={onClick} className={styles.button}>
          Click me
        </button>
      )}
    </div>
  )
}

export default ComponentName
```

### CSS Module (`ComponentName.module.css`)

```css
.container {
  /* Component wrapper styles */
}

.title {
  /* Title styles */
}

.button {
  /* Button styles */
}
```

### Test File (`__tests__/ComponentName.test.tsx`)

```tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ComponentName from '../ComponentName'

describe('ComponentName', () => {
  it('renders title correctly', () => {
    render(<ComponentName title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders children when provided', () => {
    render(
      <ComponentName title="Title">
        <span>Child content</span>
      </ComponentName>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('calls onClick when button is clicked', () => {
    const handleClick = jest.fn()
    render(<ComponentName title="Title" onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Conventions

### TypeScript

- Define props interface above component (or in `src/types/index.ts` if shared)
- Use functional components with arrow functions
- Prefix unused variables with `_`
- No semicolons (Prettier config)
- Single quotes for imports

### Styling

- Always use CSS Modules (`*.module.css`)
- Import as: `import * as styles from './Component.module.css'`
- Use camelCase for class names in CSS
- No inline styles unless dynamically computed

### Props Interface

- Export interface to `src/types/index.ts` if used by multiple components
- Use `React.ReactNode` for children
- Make optional props explicit with `?`

### File Naming

- PascalCase for component files: `GalleryImage.tsx`
- Match component name exactly
- CSS module matches component: `GalleryImage.module.css`

## Checklist Before Completion

1. Component file created with proper TypeScript types
2. CSS Module created (even if minimal)
3. Test file created with basic coverage
4. Props interface exported if needed elsewhere
5. Run `make test` to verify tests pass
6. Run `make lint` to verify no linting errors
