# Architecture Decisions

This file records significant architecture and design decisions made for the lulutracy Art Portfolio project. Claude should reference this when making related decisions.

## Technology Choices

### Gatsby 5.x (2024)

**Decision**: Use Gatsby as the static site generator.
**Rationale**:

- Excellent image optimization with gatsby-plugin-image
- GraphQL data layer for content management
- Static output perfect for GitHub Pages hosting
- React-based for component reusability

### TypeScript Strict Mode

**Decision**: Enable all strict TypeScript checks.
**Rationale**:

- Catches bugs at compile time
- Better IDE support and autocomplete
- Self-documenting code through types
- Required for professional-grade code

### CSS Modules

**Decision**: Use CSS Modules instead of CSS-in-JS or global CSS.
**Rationale**:

- Scoped styles prevent conflicts
- No runtime overhead (unlike styled-components)
- Works well with Gatsby's build process
- Familiar CSS syntax

### YAML for Content

**Decision**: Store painting data in YAML files.
**Rationale**:

- Human-readable and easy to edit
- Git-friendly (good diffs)
- No database required
- gatsby-transformer-yaml handles conversion

### Internationalization (i18n)

**Decision**: Use gatsby-plugin-react-i18next for multi-language support.
**Rationale**:

- Supports English (en), Chinese (zh), and Cantonese (yue)
- Integrates well with Gatsby's static generation
- JSON-based translation files are easy to maintain
- Automatic language detection and routing

**Implementation**:

- UI strings in `locales/{lang}/*.json`
- About page content in `content/about/{lang}.md`
- Painting translations in `content/paintings/locales/{lang}/`

### Dark Mode Support

**Decision**: Implement dark mode using React Context and CSS variables.
**Rationale**:

- User preference for reduced eye strain
- Modern UI expectation
- CSS variables enable efficient theme switching without re-renders
- Persists user preference in localStorage

**Implementation**:

- `ThemeContext` in `src/components/ThemeContext.tsx`
- `useTheme` hook in `src/hooks/useTheme.ts`
- CSS variables in `src/styles/global.css`
- Theme toggle in header

### Structured Dimensions

**Decision**: Use structured objects for painting dimensions instead of strings.
**Rationale**:

- Type safety with `Dimensions` interface
- Supports multiple units (cm, in, mm)
- Enables programmatic formatting
- Separates artwork dimensions from substrate size

## Code Conventions

### No Semicolons (Prettier)

**Decision**: Configure Prettier with `semi: false`.
**Rationale**: Cleaner visual appearance, ASI handles it.

### Functional Components Only

**Decision**: No class components.
**Rationale**: Hooks provide all needed functionality, simpler code.

### Test Coverage Thresholds

**Decision**: 90% line/statement/branch, 75% function coverage.
**Rationale**: High coverage ensures reliability for a portfolio site.

---

_Add new decisions below as they are made._
