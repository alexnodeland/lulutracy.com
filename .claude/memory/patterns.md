# Codebase Patterns

This file documents recurring patterns and conventions discovered in the lulutracy Art Portfolio codebase. Claude should follow these patterns for consistency.

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
# content/paintings/paintings.yaml
- title: Title Case Title
  description: Full description text
  dimensions:
    width: 40.6
    height: 50.8
    unit: cm
  substrate: canvas
  substrateSize:
    width: 40.6
    height: 50.8
    unit: cm
  medium: acrylic
  year: 'YYYY'
  alt: Descriptive alt text for accessibility
  order: 1
```

Note: `id` and image filename are derived automatically from title (kebab-case).

### Image File Naming

- Use kebab-case derived from title: `night-hours.jpg`
- Filename matches painting id automatically
- Supported formats: jpg, png, webp

## i18n Patterns

### Translation File Structure

```json
// locales/{lang}/common.json
{
  "nav": {
    "about": "About",
    "home": "Home"
  },
  "theme": {
    "switchToDark": "Switch to dark mode",
    "switchToLight": "Switch to light mode"
  }
}
```

### Using Translations in Components

```tsx
import { useTranslation } from 'gatsby-plugin-react-i18next'

const Component = () => {
  const { t } = useTranslation()
  return <span>{t('nav.about')}</span>
}
```

### i18n Page Query Pattern

```tsx
export const query = graphql`
  query PageName($language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
  }
`
```

## Theme Patterns

### Using Theme Context

```tsx
import { useTheme } from '../hooks/useTheme'

const Component = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
```

### CSS Variables for Theming

```css
/* src/styles/global.css */
:root {
  --color-background: #ffffff;
  --color-text: #333333;
}

[data-theme='dark'] {
  --color-background: #1a1a1a;
  --color-text: #f0f0f0;
}
```

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
