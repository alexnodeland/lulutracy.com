# Codebase Patterns

This file documents recurring patterns and conventions discovered in the Lulu Tracy Art Portfolio codebase. Claude should follow these patterns for consistency.

## Component Patterns

### Standard Component Structure

```tsx
import React from 'react'
import * as styles from './ComponentName.module.css'

interface ComponentNameProps {
  requiredProp: string
  optionalProp?: number
}

const ComponentName = ({ requiredProp, optionalProp }: ComponentNameProps) => {
  return <div className={styles.container}>{/* content */}</div>
}

export default ComponentName
```

### CSS Module Import

Always use `* as styles` syntax:

```tsx
import * as styles from './Component.module.css'
// NOT: import styles from './Component.module.css'
```

### Props Interface Location

- Simple props: Define above component in same file
- Shared props: Export from `src/types/index.ts`

## Testing Patterns

### Component Test Structure

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import Component from '../Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component prop="value" />)
    expect(screen.getByText('expected')).toBeInTheDocument()
  })
})
```

### Mocking GraphQL Data

```tsx
const mockData = {
  allPaintingsYaml: {
    nodes: [
      {
        paintings: [
          /* mock paintings */
        ],
      },
    ],
  },
}
render(<PageComponent data={mockData} />)
```

## Content Patterns

### Painting Entry Format

```yaml
- id: kebab-case-unique-id
  title: Title Case Title
  description: Full description text
  dimensions: 'W" x H"'
  canvasSize: WxH
  medium: Medium description
  year: 'YYYY'
  image: ./images/filename.jpg
  alt: Descriptive alt text for accessibility
  order: 1
```

### Image File Naming

- Use kebab-case: `autumn-leaves.jpg`
- Match painting id when possible
- Supported formats: jpg, png, webp

## Git Patterns

### Branch Naming

- Features: `feature/description`
- Fixes: `fix/description`
- Claude branches: `claude/description-XXXXX`

### Commit Messages

Format: `type(scope): subject`

- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, deps
- Subject: lowercase, no period, imperative mood

---

_Add new patterns as they are discovered._
