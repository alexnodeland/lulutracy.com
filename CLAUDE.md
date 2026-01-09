# CLAUDE.md - AI Assistant Guide

This document provides context and conventions for AI assistants working with the Lulu Tracy Art Portfolio codebase.

## Project Overview

**What**: A Gatsby-based art portfolio website showcasing watercolor and acrylic paintings by Lulu Tracy.

**Tech Stack**:

- Gatsby 5.13 (React static site generator)
- React 18.2 with TypeScript 5.3 (strict mode)
- CSS Modules for scoped styling
- Jest + Testing Library for tests
- GitHub Pages deployment

**Live Site**: https://alexnodeland.github.io/lulutracy.com

## Quick Reference

```bash
# Development
make dev          # Start dev server at http://localhost:8000
make build        # Production build
make test         # Run tests
make lint         # Check linting
make validate     # All checks (lint, typecheck, format, test)
make ci           # Full CI pipeline locally
```

## Project Structure

```
src/
├── components/      # Reusable React components with CSS modules
│   └── __tests__/   # Component tests
├── pages/           # Auto-routed Gatsby pages (index, about, 404)
│   └── __tests__/   # Page tests
├── templates/       # Dynamic page templates (painting detail)
├── styles/          # Global CSS
├── types/           # TypeScript interfaces
├── hooks/           # Custom React hooks (placeholder)
└── utils/           # Utility functions (placeholder)

content/
├── paintings/
│   ├── index.yaml   # Painting metadata (id, title, description, etc.)
│   └── images/      # Painting image files
├── about.md         # About page content (Markdown + frontmatter)
└── site.yaml        # Site configuration

Key config files:
- gatsby-config.js   # Gatsby plugins and site metadata
- gatsby-node.js     # Dynamic page generation for paintings
- tsconfig.json      # TypeScript configuration
- jest.config.js     # Jest test configuration
```

## Code Conventions

### TypeScript

- **Strict mode enabled** - all strict checks are active
- Use interfaces for component props (defined in `src/types/index.ts`)
- Prefix unused variables with `_` (e.g., `_unusedParam`)
- Path aliases available: `@/components/*`, `@/hooks/*`, `@/styles/*`, `@/types/*`, `@/utils/*`

### Formatting (Prettier)

- No semicolons
- Single quotes (except JSX which uses double)
- 2-space indentation
- Trailing commas (ES5 style)
- 80 character line width

```typescript
// Correct style example
const MyComponent = ({ title, onClick }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <button onClick={onClick} className={styles.button}>
      {title}
    </button>
  )
}
```

### Components

- Use functional components with hooks
- CSS Modules for styling (`*.module.css` files)
- Place tests in `__tests__/` directories adjacent to components
- Export types/interfaces from `src/types/index.ts`

### Styling

- Use CSS Modules (import as `import * as styles from './Component.module.css'`)
- Global styles in `src/styles/global.css`
- No inline styles unless dynamically computed

## Testing Requirements

**Coverage Thresholds (enforced)**:

- Lines: 90%
- Statements: 90%
- Branches: 90%
- Functions: 75%

**Test Location**: Place tests in `__tests__/` folders next to the code being tested.

**Mocks Available**:

- `__mocks__/gatsby.js` - Gatsby APIs
- `__mocks__/gatsby-plugin-image.js` - Image components
- `__mocks__/styleMock.js` - CSS imports
- `__mocks__/fileMock.js` - Static file imports

**Example Test**:

```typescript
import React from 'react'
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

## Commit Message Format

Uses [Conventional Commits](https://www.conventionalcommits.org/). Format: `<type>(<scope>): <subject>`

**Allowed Types**:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `perf` - Performance improvement
- `test` - Adding tests
- `build` - Build system changes
- `ci` - CI configuration
- `chore` - Maintenance
- `deps` - Dependency updates

**Rules**:

- Subject must be lowercase
- No period at end
- Max 72 characters in header
- Pre-commit hook validates format automatically

**Examples**:

```bash
feat: add gallery filter component
fix: resolve image loading on slow connections
docs: update README with deployment instructions
perf(images): optimize webp compression
deps: update gatsby to v5.14
```

## Content Management

### Adding a New Painting

1. Add image to `content/paintings/images/`
2. Add entry to `content/paintings/index.yaml`:

```yaml
- id: unique-slug
  title: Painting Title
  description: Description text
  dimensions: '16" x 20"'
  canvasSize: 16x20
  medium: Watercolor on paper
  year: '2024'
  image: ./images/filename.jpg
  alt: Alt text for accessibility
  order: 1 # Display order in gallery
```

### Modifying About Page

Edit `content/about.md` - supports Markdown with YAML frontmatter for title, artistName, and photo path.

### Site Configuration

Edit `content/site.yaml` for site-wide settings (title, navigation, social links, copyright).

## CI/CD Pipeline

**On Pull Requests**:

1. TypeScript type checking
2. ESLint linting
3. Prettier format check
4. Jest tests with coverage
5. Gatsby production build
6. Lighthouse performance audit (comments on PR)

**On Push to Main**:

- Automatic deployment to GitHub Pages

## Important Patterns

### Gatsby Image Usage

```typescript
// For dynamic images (from GraphQL)
import { GatsbyImage, getImage } from 'gatsby-plugin-image'

const image = getImage(data.file.childImageSharp)
return <GatsbyImage image={image} alt="description" />

// For static images (known at build time)
import { StaticImage } from 'gatsby-plugin-image'

return <StaticImage src="../images/logo.png" alt="Logo" />
```

### GraphQL Queries

```typescript
// Page query (available in page components)
export const query = graphql`
  query {
    allPaintingsYaml {
      nodes {
        paintings {
          id
          title
          # ... other fields
        }
      }
    }
  }
`
```

### Dynamic Page Generation

Pages for individual paintings are created in `gatsby-node.js` using the painting data from YAML. Route pattern: `/painting/{id}`

## Troubleshooting

**Build Issues**: Run `make clean && make build`

**Sharp/Image Errors**: Run `npm rebuild sharp`

**Type Errors**: Run `make typecheck` to see all TypeScript issues

**Test Failures**: Run `make test-watch` to debug interactively

## Files to Avoid Modifying

- `.github/workflows/` - CI/CD pipelines (modify carefully)
- `__mocks__/` - Test mocks (only if needed for new dependencies)
- `.husky/` - Git hooks (rarely needs changes)

## Files Commonly Modified

- `content/paintings/index.yaml` - Add/edit paintings
- `src/components/` - UI components
- `src/pages/` - Page layouts
- `src/styles/global.css` - Global styling
- `content/about.md` - About page content

## Claude Code Automation

This project includes comprehensive Claude Code automation:

### Skills (Knowledge Templates)

Located in `.claude/skills/`:

| Skill                 | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `gatsby-content`      | Add paintings, edit about page, site config |
| `component-generator` | Scaffold React components with CSS Modules  |
| `test-writer`         | Write Jest tests with project patterns      |
| `lighthouse-fix`      | Fix performance and accessibility issues    |
| `graphql-query`       | Write and debug Gatsby GraphQL queries      |

### Agents (Independent Workers)

Located in `.claude/agents/`:

| Agent                 | Purpose                        | Invoke with            |
| --------------------- | ------------------------------ | ---------------------- |
| `pr-reviewer`         | Code review and quality checks | `@pr-reviewer`         |
| `accessibility-audit` | Deep a11y analysis             | `@accessibility-audit` |
| `gatsby-debug`        | Troubleshoot Gatsby issues     | `@gatsby-debug`        |
| `deploy-check`        | Pre-deployment verification    | `@deploy-check`        |
| `refactor-guide`      | Safe refactoring guidance      | `@refactor-guide`      |

### Hooks (Automated Actions)

Configured in `.claude/settings.json`:

| Hook                   | Event                    | Action                                   |
| ---------------------- | ------------------------ | ---------------------------------------- |
| `session-start.sh`     | SessionStart             | Load git status, environment info, TODOs |
| `stop-validate.sh`     | Stop                     | Run typecheck, lint, format checks       |
| `post-write-format.sh` | PostToolUse (Write/Edit) | Auto-format changed files                |
| `pre-bash-safety.sh`   | PreToolUse (Bash)        | Block dangerous commands                 |
| `post-bash-build.sh`   | PostToolUse (Bash)       | Verify build after changes               |

### Permissions

Configured in `.claude/settings.json` to restrict Claude's access:

**Allowed**:

- Read/Write/Edit in `src/`, `content/`, `.claude/`
- Common bash commands (`npm`, `make`, `git`, `node`)

**Denied**:

- Modifying `node_modules/`, `.git/`, `package-lock.json`
- Destructive commands (`rm -rf /`, `sudo`, `npm publish`)
- Force pushing to main branch

### Memory (Persistent Context)

Located in `.claude/memory/`:

| File              | Purpose                           |
| ----------------- | --------------------------------- |
| `decisions.md`    | Architecture and design decisions |
| `known-issues.md` | Known problems and workarounds    |
| `patterns.md`     | Codebase patterns to follow       |

Claude should reference these files for consistency and to avoid repeating past mistakes.

### MCP Servers

Configured in `.mcp.json` (disabled by default, enable as needed):

| Server       | Purpose                                             |
| ------------ | --------------------------------------------------- |
| `filesystem` | Enhanced file operations                            |
| `github`     | GitHub PR/issue integration (requires GITHUB_TOKEN) |
| `fetch`      | Web fetching capabilities                           |

## Environment Requirements

### Local Development

- Node.js 18+ required
- Run `npm install` before development
- All make commands work after dependency installation

### Restricted Environments (Claude Code Web)

Some environments have network restrictions that prevent `sharp` from installing:

```
sharp: Installation error: tunneling socket could not be established
```

**Workarounds**:

- TypeScript checking works: `make typecheck`
- Linting works: `make lint`
- Format checking works: `make format-check`
- **Build fails**: Requires `sharp` - use CI/CD for build verification
- **Tests may fail**: Some tests depend on image processing

**Hooks handle this gracefully** - they skip operations when dependencies aren't available.

### Full Validation

For complete validation including build, use CI/CD pipeline or a local environment with full network access:

```bash
npm ci          # Clean install
make ci         # Full CI pipeline
```
