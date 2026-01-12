# Claude Code Automation

## Skills (Knowledge Templates)

Located in `.claude/skills/`:

| Skill                 | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `gatsby-content`      | Add paintings, edit about page, site config |
| `component-generator` | Scaffold React components with CSS Modules  |
| `test-writer`         | Write Jest tests with project patterns      |
| `lighthouse-fix`      | Fix performance and accessibility issues    |
| `graphql-query`       | Write and debug Gatsby GraphQL queries      |

## Agents (Independent Workers)

Located in `.claude/agents/`:

| Agent                 | Purpose                        |
| --------------------- | ------------------------------ |
| `pr-reviewer`         | Code review and quality checks |
| `accessibility-audit` | Deep a11y analysis             |
| `gatsby-debug`        | Troubleshoot Gatsby issues     |
| `deploy-check`        | Pre-deployment verification    |
| `refactor-guide`      | Safe refactoring guidance      |

## Hooks (Automated Actions)

| Hook                   | Event                    | Action                                   |
| ---------------------- | ------------------------ | ---------------------------------------- |
| `session-start.sh`     | SessionStart             | Load git status, environment info, TODOs |
| `stop-validate.sh`     | Stop                     | Run typecheck, lint, format checks       |
| `post-write-format.sh` | PostToolUse (Write/Edit) | Auto-format changed files                |
| `pre-bash-safety.sh`   | PreToolUse (Bash)        | Block dangerous commands                 |
| `post-bash-build.sh`   | PostToolUse (Bash)       | Verify build after changes               |

## Memory Files

Located in `.claude/memory/`:

| File              | Purpose                           |
| ----------------- | --------------------------------- |
| `decisions.md`    | Architecture and design decisions |
| `known-issues.md` | Known problems and workarounds    |
| `patterns.md`     | Codebase patterns to follow       |

## MCP Servers

Configured in `.mcp.json`:

| Server       | Status   | Purpose                                             |
| ------------ | -------- | --------------------------------------------------- |
| `filesystem` | Enabled  | Enhanced file operations                            |
| `github`     | Disabled | GitHub PR/issue integration (requires GITHUB_TOKEN) |
| `fetch`      | Disabled | Web fetching capabilities                           |
