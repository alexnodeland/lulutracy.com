#!/bin/bash
# PreToolUse Hook - Safety gate for dangerous Bash commands
# Location: .claude/hooks/pre-bash-safety.sh
#
# This hook runs BEFORE Bash commands execute
# Exit code 2 blocks the command and sends feedback to Claude
#
# Note: The command being checked is passed via environment or stdin
# depending on Claude Code version

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.."

# The command to check (passed as argument or via CLAUDE_BASH_COMMAND)
COMMAND="${1:-$CLAUDE_BASH_COMMAND}"

# If no command provided, allow (can't check what we don't have)
if [ -z "$COMMAND" ]; then
    exit 0
fi

# Define dangerous patterns
DANGEROUS_PATTERNS=(
    "rm -rf /"
    "rm -rf ~"
    "rm -rf \$HOME"
    "rm -rf ."
    "rm -rf .."
    "git push --force origin main"
    "git push -f origin main"
    "git push --force origin master"
    "git push -f origin master"
    "git reset --hard origin"
    "npm publish"
    "yarn publish"
    "> /dev/sda"
    "mkfs."
    "dd if="
    ":(){:|:&};:"
    "chmod -R 777 /"
    "chown -R"
)

# Check each dangerous pattern
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if echo "$COMMAND" | grep -qF "$pattern"; then
        echo "BLOCKED: Potentially dangerous command detected" >&2
        echo "Pattern matched: $pattern" >&2
        echo "Command: $COMMAND" >&2
        echo "" >&2
        echo "If this command is intentional, please confirm with the user." >&2
        exit 2  # Block and send feedback to Claude
    fi
done

# Warn (but don't block) on other risky patterns
WARN_PATTERNS=(
    "rm -rf"
    "git push --force"
    "git push -f"
    "git reset --hard"
    "DROP TABLE"
    "DROP DATABASE"
    "DELETE FROM"
    "sudo"
)

for pattern in "${WARN_PATTERNS[@]}"; do
    if echo "$COMMAND" | grep -qF "$pattern"; then
        echo "WARNING: Potentially risky command" >&2
        echo "Pattern: $pattern" >&2
        echo "Command: $COMMAND" >&2
        echo "Proceeding with caution..." >&2
        # Don't block, just warn
        break
    fi
done

exit 0
