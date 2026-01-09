#!/bin/bash
# Stop Hook - Quality gate when Claude finishes responding
# Location: .claude/hooks/stop-validate.sh
#
# Exit codes:
#   0 - Success (silent)
#   2 - Failure (stderr sent to Claude for fixing)
#   other - Non-blocking error

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.."

# Skip if no node_modules (can't run validation)
if [ ! -d "node_modules" ]; then
    echo "Skipping validation: dependencies not installed" >&2
    exit 0
fi

# Skip if no changes to validate
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
    exit 0
fi

echo "=== Running validation checks ===" >&2

ERRORS=""

# TypeScript check (fast, no external deps)
echo "Checking TypeScript..." >&2
if ! npm run typecheck 2>&1; then
    ERRORS="${ERRORS}TypeScript errors found.\n"
fi

# ESLint check
echo "Checking ESLint..." >&2
if ! npm run lint 2>&1; then
    ERRORS="${ERRORS}Linting errors found.\n"
fi

# Prettier check
echo "Checking formatting..." >&2
if ! npm run format:check 2>&1; then
    ERRORS="${ERRORS}Formatting issues found. Run 'make format' to fix.\n"
fi

# Report results
if [ -n "$ERRORS" ]; then
    echo "" >&2
    echo "=== VALIDATION FAILED ===" >&2
    echo -e "$ERRORS" >&2
    echo "Please fix the above issues." >&2
    exit 2  # Exit 2 sends stderr to Claude
fi

echo "=== All checks passed ===" >&2
exit 0
