# Architecture Decisions

This file records significant architecture and design decisions made for the Lulu Tracy Art Portfolio project. Claude should reference this when making related decisions.

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

*Add new decisions below as they are made.*
