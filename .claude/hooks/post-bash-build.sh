#!/bin/bash
# PostToolUse Hook - Verify build after significant Bash operations
# Location: .claude/hooks/post-bash-build.sh
#
# This hook runs after Bash commands that might affect the build
# It performs a quick build verification when appropriate

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.."

# Skip if no node_modules (can't build anyway)
if [ ! -d "node_modules" ]; then
    echo "Skipping build check: dependencies not installed" >&2
    exit 0
fi

# Check if gatsby is available (sharp might have failed to install)
if ! npx gatsby --version &>/dev/null; then
    echo "Skipping build check: Gatsby not available (sharp install may have failed)" >&2
    echo "This is expected in some restricted environments." >&2
    echo "Full build verification should be done in CI/CD." >&2
    exit 0
fi

# Count recently modified source files
MODIFIED_COUNT=$(git diff --name-only --diff-filter=ACMR 2>/dev/null | grep -E '\.(ts|tsx|js|jsx|yaml|md)$' | wc -l || echo "0")

# Only run build check if multiple files changed (significant change)
if [ "$MODIFIED_COUNT" -lt 3 ]; then
    exit 0
fi

echo "=== Running build verification (${MODIFIED_COUNT} files changed) ===" >&2

# Run gatsby build with timeout
if timeout 120 npm run build &>/dev/null; then
    echo "Build: OK" >&2
else
    BUILD_EXIT=$?
    if [ "$BUILD_EXIT" -eq 124 ]; then
        echo "Build: TIMEOUT (>120s) - skipping" >&2
    else
        echo "Build: FAILED" >&2
        echo "Run 'make build' to see full error output." >&2
        # Don't block with exit 2 - build failures should be investigated, not auto-fixed
    fi
fi

exit 0
