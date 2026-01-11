# Lulu Tracy Art Portfolio

Gatsby-based art portfolio with i18n (en, zh, yue, ms), dark mode, and image magnification.

**Live Site**: https://alexnodeland.github.io/lulutracy.com

## Commands

```bash
make dev          # Dev server at localhost:8000
make build        # Production build
make test         # Run tests
make lint         # Check linting
make typecheck    # TypeScript checks
make validate     # All checks (lint, typecheck, format, test)
```

## Code Style

- TypeScript strict mode with path aliases: `@/components/*`, `@/hooks/*`, etc.
- CSS Modules: `import * as styles from './Component.module.css'`
- No semicolons, single quotes, 2-space indent (Prettier enforced)
- Functional components only, props interfaces in `src/types/index.ts`

## Workflow

- IMPORTANT: Run `make typecheck` after code changes
- IMPORTANT: Run `make test` before committing
- Use Conventional Commits: `type(scope): subject` (lowercase, no period)
- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, deps

## Testing

- Coverage thresholds: 90% lines/statements/branches, 75% functions
- Place tests in `__tests__/` directories adjacent to code
- Use mocks in `__mocks__/` for Gatsby, i18n, theme context

## Common Mistakes to Avoid

- Never modify `node_modules/`, `.git/`, or `package-lock.json`
- Never force push to main branch
- Never skip running typecheck after changes
- Always provide alt text for images in `content/paintings/paintings.yaml`

## Documentation Pointers

When working on specific areas, read the relevant documentation:

- **Project structure**: See `.claude/docs/project-structure.md`
- **Adding paintings or content**: See `.claude/docs/content-management.md` or use `/gatsby-content` skill
- **Claude automation (skills, agents, hooks)**: See `.claude/docs/automation.md`
- **Architecture decisions**: See `.claude/memory/decisions.md`
- **Known issues**: See `.claude/memory/known-issues.md`
- **Code patterns**: See `.claude/memory/patterns.md`

## Troubleshooting

- **Build Issues**: Run `make clean && make build`
- **Sharp/Image Errors**: Run `npm rebuild sharp`
- **Type Errors**: Run `make typecheck` to see all issues
- **Test Failures**: Run `make test-watch` to debug interactively
