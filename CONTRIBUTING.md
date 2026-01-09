# Contributing to Lulu Tracy Portfolio

This guide covers how to set up your development environment and the workflows used in this project.

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd lulutracy.com
make prepare    # Install dependencies and git hooks

# Start developing
make dev        # Start development server at http://localhost:8000
```

## Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher
- GNU Make (optional, but recommended)

## Available Commands

### Using Make (Recommended)

| Command              | Description                            |
| -------------------- | -------------------------------------- |
| `make help`          | Show all available commands            |
| `make prepare`       | Full setup: install deps and git hooks |
| `make dev`           | Start development server               |
| `make build`         | Build production site                  |
| `make serve`         | Serve production build locally         |
| `make clean`         | Clean Gatsby cache and build artifacts |
| `make test`          | Run tests                              |
| `make test-watch`    | Run tests in watch mode                |
| `make test-coverage` | Run tests with coverage report         |
| `make lint`          | Run ESLint                             |
| `make lint-fix`      | Run ESLint with auto-fix               |
| `make format`        | Format code with Prettier              |
| `make format-check`  | Check code formatting                  |
| `make typecheck`     | Run TypeScript type checking           |
| `make validate`      | Run all validation checks              |
| `make ci`            | Run full CI pipeline locally           |
| `make ci-fast`       | Run fast checks (no build)             |

### Using npm

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `npm run develop`       | Start development server         |
| `npm run build`         | Build production site            |
| `npm run serve`         | Serve production build           |
| `npm run clean`         | Clean Gatsby cache               |
| `npm run test`          | Run tests                        |
| `npm run test:watch`    | Run tests in watch mode          |
| `npm run test:coverage` | Run tests with coverage          |
| `npm run lint`          | Run ESLint                       |
| `npm run lint:fix`      | Auto-fix lint issues             |
| `npm run format`        | Format code                      |
| `npm run format:check`  | Check formatting                 |
| `npm run typecheck`     | Type check                       |
| `npm run validate`      | All checks + tests (parallel)    |
| `npm run ci`            | Full CI (checks + tests + build) |

## Development Workflow

### 1. Before You Start

```bash
# Ensure you have the latest changes
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### 2. During Development

```bash
# Start the development server
make dev

# The server runs at http://localhost:8000
# GraphQL playground at http://localhost:8000/___graphql
```

### 3. Before Committing

Pre-commit hooks automatically run lint-staged on your staged files. To manually validate:

```bash
# Quick validation (recommended before commits)
make ci-fast

# Or full CI simulation including build
make ci
```

### 4. Submitting Changes

```bash
# Stage your changes
git add .

# Commit (pre-commit hooks will run automatically)
git commit -m "feat: your descriptive message"

# Push your branch
git push -u origin feature/your-feature-name
```

## Project Structure

```
lulutracy.com/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components (auto-routed)
│   ├── templates/      # Dynamic page templates
│   ├── styles/         # CSS modules and global styles
│   ├── types/          # TypeScript type definitions
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Utility functions
├── content/
│   ├── paintings/      # Painting data and images
│   ├── site.yaml       # Site configuration
│   └── about.md        # About page content
├── .github/
│   └── workflows/      # CI/CD pipelines
├── gatsby-config.js    # Gatsby configuration
├── gatsby-node.js      # Dynamic page generation
└── Makefile            # Development commands
```

## Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Extended rules for React, accessibility, and TypeScript
- **Prettier**: Automatic formatting on save and commit
- **CSS Modules**: Scoped styling per component

## Testing

Tests are located next to the code they test in `__tests__` directories.

```bash
# Run all tests
make test

# Watch mode (re-runs on changes)
make test-watch

# With coverage report
make test-coverage
```

Coverage thresholds are enforced:

- Branches: 90%
- Functions: 75%
- Lines: 90%
- Statements: 90%

## Troubleshooting

### Build Issues

```bash
# Clear all caches and rebuild
make clean
make build
```

### Image Processing Errors

If you see sharp-related errors:

```bash
npm rebuild sharp
```

### Node Version Issues

Ensure you're using Node.js 18+:

```bash
node --version  # Should be v18.x.x or higher
```

## CI/CD Pipeline

The CI pipeline runs on every push and PR:

1. **Checks** (parallel): TypeScript, ESLint, Prettier
2. **Tests**: Jest with coverage
3. **Build**: Gatsby production build

Deployment to GitHub Pages happens automatically on pushes to `main`.

## Performance Tips

- Use `StaticImage` for fixed images (logo, icons)
- Use `GatsbyImage` with GraphQL for dynamic images
- Images support WebP, AVIF, and fallback formats automatically
- The development server has hot reload enabled
