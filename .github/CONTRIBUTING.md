# Contributing

Guidelines for code contributions. For content changes (paintings, about page), see the [README](../README.md).

## Code Standards

**TypeScript**: Strict mode. Define interfaces in `src/types/index.ts`.

**Formatting** (Prettier enforced):

- No semicolons, single quotes, 2-space indent, trailing commas

**Components**: Functional with hooks, CSS Modules (`*.module.css`), tests in `__tests__/`

## Testing

Coverage thresholds (90% lines/statements/branches, 75% functions):

```bash
make test             # Run tests
make test-watch       # Watch mode
make test-coverage    # Coverage report
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add gallery filter
fix: resolve image loading
docs: update README
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Rules: lowercase, no period, max 72 chars

## Pull Requests

1. Create branch from `main`
2. Push changes (CI runs automatically)
3. Open PR (Lighthouse scores posted as comment)
4. Merge (squash and merge) when CI passes (auto-deploys)

**Checklist**:

- [ ] CI passes
- [ ] Lighthouse scores green (90+)
- [ ] Alt text on new images

## Claude Code Tools

**Skills** (invoke with `/command`):

- `gatsby-content` - Content management
- `component-generator` - Scaffold components
- `test-writer` - Generate tests
- `lighthouse-fix` - Performance fixes
- `graphql-query` - Debug GraphQL

**Agents** (specialized tasks):

- `pr-reviewer` - Code review
- `accessibility-audit` - A11y analysis
- `gatsby-debug` - Build issues
- `deploy-check` - Pre-deploy verification

**Hooks** (automatic):

- Session start: Loads git status and environment
- After edits: Auto-formats files
- Before bash: Blocks dangerous commands
- On stop: Runs validation checks

## Claude Code Web Notes

Some operations fail due to network restrictions (`npm install`, builds). Use CI for verification - push and check the pipeline.

## Files

**Safe to modify**: `content/**`, `src/**`

**Modify carefully**: `gatsby-config.js`, `gatsby-node.js`, `.github/workflows/**`

**Don't modify**: `node_modules/`, `package-lock.json`
