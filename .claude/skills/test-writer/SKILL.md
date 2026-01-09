---
name: test-writer
description: Write Jest tests for React components in this Gatsby project. Use this skill when creating new tests or improving test coverage. Handles Gatsby-specific mocking and Testing Library patterns.
---

# Jest Test Writer

Create tests that meet project coverage requirements and follow established patterns.

## Coverage Requirements

Tests must meet these thresholds (enforced in CI):

| Metric     | Threshold |
| ---------- | --------- |
| Lines      | 90%       |
| Statements | 90%       |
| Branches   | 90%       |
| Functions  | 75%       |

## Test File Location

Place tests in `__tests__/` directories adjacent to the code:

```
src/components/
├── Header.tsx
└── __tests__/
    └── Header.test.tsx

src/pages/
├── index.tsx
└── __tests__/
    └── index.test.tsx
```

## Basic Test Template

```tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ComponentName from '../ComponentName'

describe('ComponentName', () => {
  // Basic rendering
  it('renders without crashing', () => {
    render(<ComponentName requiredProp="value" />)
  })

  // Content verification
  it('displays the correct content', () => {
    render(<ComponentName title="Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  // User interaction
  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<ComponentName onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // Conditional rendering
  it('shows element when condition is true', () => {
    render(<ComponentName showExtra={true} />)
    expect(screen.getByTestId('extra')).toBeInTheDocument()
  })

  it('hides element when condition is false', () => {
    render(<ComponentName showExtra={false} />)
    expect(screen.queryByTestId('extra')).not.toBeInTheDocument()
  })
})
```

## Available Mocks

### Gatsby Mock (`__mocks__/gatsby.js`)

Provides mocks for:

- `Link` - Renders as `<a>` tag
- `graphql` - Returns template literal
- `useStaticQuery` - Returns mock data (customize per test)

### Gatsby Plugin Image Mock (`__mocks__/gatsby-plugin-image.js`)

Provides mocks for:

- `GatsbyImage` - Renders placeholder div
- `StaticImage` - Renders placeholder div
- `getImage` - Returns mock image data

### CSS Module Mock (`__mocks__/styleMock.js`)

Returns empty object for CSS imports.

### File Mock (`__mocks__/fileMock.js`)

Returns string `'test-file-stub'` for static file imports.

## Testing Gatsby Components

### Components Using `Link`

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import Navigation from '../Navigation'

// Gatsby Link is automatically mocked
it('renders navigation links', () => {
  render(<Navigation />)
  expect(screen.getByText('Home')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
    'href',
    '/about'
  )
})
```

### Components Using Images

```tsx
// GatsbyImage and StaticImage are automatically mocked
it('renders painting image', () => {
  const mockPainting = {
    id: 'test',
    title: 'Test Painting',
    alt: 'A test painting',
    // ... other fields
  }
  const mockImage = {
    /* mock gatsby image data */
  }

  render(<GalleryImage painting={mockPainting} image={mockImage} />)
  expect(screen.getByAltText('A test painting')).toBeInTheDocument()
})
```

### Testing Page Components with GraphQL Data

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import IndexPage from '../index'

const mockData = {
  allPaintingsYaml: {
    nodes: [
      {
        paintings: [
          {
            id: 'test-painting',
            title: 'Test Painting',
            // ... other required fields
          },
        ],
      },
    ],
  },
  allFile: {
    nodes: [],
  },
}

describe('IndexPage', () => {
  it('renders gallery', () => {
    render(<IndexPage data={mockData} />)
    expect(screen.getByText('Test Painting')).toBeInTheDocument()
  })
})
```

## Testing Patterns

### Query Methods

| Method     | Use When                                |
| ---------- | --------------------------------------- |
| `getBy*`   | Element should exist (throws if not)    |
| `queryBy*` | Element might not exist (returns null)  |
| `findBy*`  | Element appears async (returns Promise) |

### Common Queries

```tsx
screen.getByText('Hello') // Exact text match
screen.getByText(/hello/i) // Regex (case insensitive)
screen.getByRole('button') // By ARIA role
screen.getByRole('link', { name: 'About' }) // Role + accessible name
screen.getByTestId('custom-id') // By data-testid attribute
screen.getByAltText('Image desc') // By alt attribute
```

## Running Tests

```bash
make test           # Run all tests
make test-watch     # Watch mode
make test-coverage  # With coverage report
```

## Checklist

1. Test file in correct `__tests__/` location
2. Covers main render scenarios
3. Covers user interactions (clicks, inputs)
4. Covers conditional rendering branches
5. Uses appropriate query methods
6. No console warnings in test output
7. Coverage meets thresholds
