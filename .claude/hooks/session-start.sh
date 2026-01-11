#!/bin/bash
# SessionStart Hook - Load project context at session start
# Location: .claude/hooks/session-start.sh

set -e

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.."

echo "=== PROJECT: lulutracy Art Portfolio ==="
echo ""

# Git status
echo "=== GIT STATUS ==="
if command -v git &> /dev/null && [ -d .git ]; then
    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    echo "Branch: $BRANCH"

    # Check for uncommitted changes
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        echo "Uncommitted changes:"
        git status --short
    else
        echo "Working tree clean"
    fi
    echo ""

    # Recent commits
    echo "=== RECENT COMMITS ==="
    git log --oneline -5 2>/dev/null || echo "No commits found"
else
    echo "Git not available or not a git repository"
fi
echo ""

# Environment check
echo "=== ENVIRONMENT ==="
echo "Node: $(node --version 2>/dev/null || echo 'not found')"
echo "npm: $(npm --version 2>/dev/null || echo 'not found')"

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    echo "Dependencies: installed"
else
    echo "Dependencies: NOT INSTALLED (run 'npm install')"
fi
echo ""

# Check for failing tests (quick check if deps available)
if [ -d "node_modules" ] && [ -f "package.json" ]; then
    echo "=== QUICK HEALTH CHECK ==="
    # Only run typecheck as it's fast and doesn't need sharp
    if npm run typecheck &>/dev/null; then
        echo "TypeScript: OK"
    else
        echo "TypeScript: ERRORS (run 'make typecheck' for details)"
    fi
fi
echo ""

# Outstanding TODOs
echo "=== TODOs IN CODE ==="
TODO_COUNT=$(grep -r "TODO:" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l || echo "0")
if [ "$TODO_COUNT" -gt 0 ]; then
    echo "Found $TODO_COUNT TODOs:"
    grep -r "TODO:" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -5
    [ "$TODO_COUNT" -gt 5 ] && echo "... and $((TODO_COUNT - 5)) more"
else
    echo "No TODOs found"
fi

exit 0
