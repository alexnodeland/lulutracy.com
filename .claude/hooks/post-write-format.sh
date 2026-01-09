#!/bin/bash
# PostToolUse Hook - Format files after Write/Edit operations
# Location: .claude/hooks/post-write-format.sh
#
# This hook runs after Claude writes or edits files
# It auto-formats to ensure consistent style

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.."

# Skip if no node_modules
if [ ! -d "node_modules" ]; then
    exit 0
fi

# Get list of staged/modified TypeScript and related files
CHANGED_FILES=$(git diff --name-only --diff-filter=ACMR 2>/dev/null | grep -E '\.(ts|tsx|js|jsx|json|css|md|yaml|yml)$' || true)

if [ -z "$CHANGED_FILES" ]; then
    exit 0
fi

# Format changed files with Prettier
echo "Auto-formatting changed files..." >&2
for file in $CHANGED_FILES; do
    if [ -f "$file" ]; then
        npx prettier --write "$file" 2>/dev/null || true
    fi
done

# Run ESLint fix on TS/JS files only
TS_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' || true)
if [ -n "$TS_FILES" ]; then
    echo "Auto-fixing lint issues..." >&2
    for file in $TS_FILES; do
        if [ -f "$file" ]; then
            npx eslint --fix "$file" 2>/dev/null || true
        fi
    done
fi

exit 0
