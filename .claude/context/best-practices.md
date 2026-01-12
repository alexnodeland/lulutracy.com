# CI/CD patterns for Claude Code configuration management

Claude Code’s configuration ecosystem has matured significantly through late 2025, introducing sandboxing, plugins, and advanced hook systems. **The highest-leverage configuration investments are hierarchical CLAUDE.md files that stay concise, deterministic hooks for quality enforcement, and GitHub Actions workflows for automated code review.** This guide provides advanced developers with concrete, implementable patterns for maintaining context files across team and enterprise environments.

## Memory hierarchy determines context loading

Claude Code loads configuration through a strict precedence chain: enterprise policies at the top, followed by user settings, project configuration, and finally local overrides. Understanding this hierarchy is essential for teams deploying Claude at scale.

| Memory type       | Location                                                    | Shared with             | Use case                                |
| ----------------- | ----------------------------------------------------------- | ----------------------- | --------------------------------------- |
| Enterprise policy | `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS) | All org users           | Security policies, compliance rules     |
| User memory       | `~/.claude/CLAUDE.md`                                       | Just you (all projects) | Personal code style, editor preferences |
| Project memory    | `./CLAUDE.md` or `./.claude/CLAUDE.md`                      | Team (via git)          | Architecture, build commands, standards |
| Project local     | `./CLAUDE.local.md`                                         | Just you                | Personal sandbox URLs, local paths      |

Claude reads memories **recursively** from the current directory upward, automatically loading parent CLAUDE.md files in monorepos. Child directory files load on-demand when Claude accesses those paths. This enables elegant monorepo patterns where `packages/api/CLAUDE.md` inherits from root while adding API-specific context.

The import syntax using `@path/to/file` provides a more flexible alternative to CLAUDE.local.md:

```markdown
# CLAUDE.md with imports

See @README for project overview.
Reference @docs/architecture.md for system design.

# Personal preferences across git worktrees

@~/.claude/my-project-instructions.md
```

Imports work better than CLAUDE.local.md when using git worktrees because the symlinked paths resolve correctly across parallel checkouts.

## Keep CLAUDE.md lean—frontier models follow roughly 150 instructions reliably

Research from HumanLayer reveals that frontier thinking LLMs follow **150-200 instructions** with reasonable consistency before degradation. Since Claude Code’s system prompt already consumes approximately 50 instruction slots, your CLAUDE.md budget is effectively **100-150 instructions**.

**Optimal length**: Under 300 lines. Production CLAUDE.md files from experienced practitioners average **60 lines**. Start by documenting only what Claude gets wrong, not theoretically useful information. Claude’s system includes a reminder that context “may or may not be relevant”—overly generic instructions get deprioritized.

A proven template structure:

```markdown
# Bash commands

- npm run build: Build the project
- npm run typecheck: Run the typechecker

# Code style

- Use ES modules (import/export) syntax, not CommonJS
- Destructure imports when possible

# Workflow

- Run typecheck after code changes
- Prefer single tests over full test suite

# Common mistakes to avoid

- Never modify .claude/ directory directly
- Always run tests before committing
```

For complex projects, use progressive disclosure with **pointer files** rather than embedding documentation:

```markdown
# Project Documentation

When working on database operations, read `agent_docs/database_schema.md`
For complex FooBarError debugging, see `agent_docs/troubleshooting.md`
```

Anti-patterns to avoid:

- **@-mentioning entire doc files**: Bloats context by embedding full content. Instead, describe _when_ to read the file
- **Negative-only constraints**: “Never use –foo-bar” leaves Claude stuck. Always provide alternatives
- **Using Claude as a linter**: Use deterministic tools and hooks instead

## Ten hook types provide deterministic control over Claude’s lifecycle

Hooks execute shell commands at specific lifecycle points, guaranteeing consistent behavior where prompts would be unreliable. Configure hooks in `.claude/settings.json` (team-shared) or `.claude/settings.local.json` (personal).

**PreToolUse** fires before any tool executes, enabling validation and blocking:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/validate-bash.py"
          }
        ]
      }
    ]
  }
}
```

A security validation script that blocks dangerous patterns:

```python
#!/usr/bin/env python3
import json, sys, re

dangerous_patterns = [
    r'rm\s+.*-[rf]',
    r'sudo\s+rm',
    r'chmod\s+777',
    r'>\s*/etc/',
]

input_data = json.load(sys.stdin)
command = input_data.get("tool_input", {}).get("command", "")

for pattern in dangerous_patterns:
    if re.search(pattern, command, re.IGNORECASE):
        print(f"BLOCKED: Pattern '{pattern}' detected", file=sys.stderr)
        sys.exit(2)  # Exit code 2 blocks the tool call
```

**PostToolUse** runs after tool completion—ideal for auto-formatting:

```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "jq -r '.tool_input.file_path' | xargs -I {} npx prettier --write {}"
        }
      ]
    }
  ]
}
```

**Stop** hooks force Claude to continue when validation fails:

```json
{
  "Stop": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "npm run lint && npm run typecheck || echo '{\"decision\": \"block\", \"reason\": \"Lint/typecheck failed\"}'"
        }
      ]
    }
  ]
}
```

**PermissionRequest** (v2.0.45+) auto-approves safe commands:

```json
{
  "PermissionRequest": [
    {
      "matcher": "Bash(npm test*)",
      "hooks": [
        {
          "type": "command",
          "command": "echo '{\"hookSpecificOutput\": {\"decision\": {\"behavior\": \"allow\"}}}'"
        }
      ]
    }
  ]
}
```

**SessionStart** injects context when Claude starts:

```json
{
  "SessionStart": [
    {
      "matcher": "startup",
      "hooks": [
        {
          "type": "command",
          "command": "git status --short && echo '---' && cat TODO.md 2>/dev/null || true"
        }
      ]
    }
  ]
}
```

Other hook types include **SubagentStop** (for Task tool completion), **PreCompact** (before context compaction), **Notification** (for alerts), and **UserPromptSubmit** (for prompt validation).

Security warning: Hooks execute with your user permissions and can access any files your account can access. Always review hook scripts before enabling them.

## GitHub Actions integration enables @claude mentions and automated workflows

The `anthropics/claude-code-action@v1` action (GA release August 2025) provides intelligent mode detection—automatically selecting between interactive @claude responses and automated execution based on workflow context.

Basic setup for @claude mentions in PRs and issues:

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

Path-specific documentation updates on API changes:

```yaml
name: Sync API Documentation
on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - 'src/api/**/*.ts'
      - 'src/routes/**/*.ts'

jobs:
  doc-sync:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.pull_request.head.ref }}
          fetch-depth: 0
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Update API documentation in README.md to reflect changes.
            Examine changed files and update:
            1. Endpoint descriptions
            2. Request/response examples  
            3. Parameter documentation
          claude_args: |
            --allowedTools Edit,Read,Write,Bash(git:*)
            --max-turns 10
```

Scheduled maintenance workflow for documentation refresh:

```yaml
name: Claude Scheduled Docs
on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight UTC

jobs:
  doc-maintenance:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Review last 24 hours of commits.
            Tasks:
            1. Identify documentation needing updates
            2. Check for outdated code comments
            3. Update CHANGELOG.md if needed
            4. Create documentation PR if changes needed
          claude_args: |
            --model claude-opus-4-5-20251101
            --max-turns 15
```

For AWS Bedrock, use OIDC authentication:

```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: us-west-2

- uses: anthropics/claude-code-action@v1
  with:
    use_bedrock: 'true'
    claude_args: '--model us.anthropic.claude-sonnet-4-5-20250929-v1:0'
```

## GitLab CI/CD requires manual pipeline configuration with OIDC patterns

GitLab’s integration (beta, maintained by GitLab) uses webhook triggers to invoke Claude on @mentions in MRs and issues. Unlike GitHub’s native event detection, GitLab requires explicit pipeline trigger configuration.

Basic GitLab CI job:

```yaml
stages:
  - ai

claude:
  stage: ai
  image: node:24-alpine3.21
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  before_script:
    - apk add --no-cache git curl bash
    - npm install -g @anthropic-ai/claude-code
  script:
    - >
      claude
      -p "${AI_FLOW_INPUT:-'Review this MR and implement requested changes'}"
      --permission-mode acceptEdits
      --allowedTools "Bash(*) Read(*) Edit(*) Write(*) mcp__gitlab"
```

AWS Bedrock with GitLab OIDC (no static credentials):

```yaml
claude-bedrock:
  stage: ai
  image: node:24-alpine3.21
  before_script:
    - apk add --no-cache bash curl jq git python3 py3-pip
    - pip install --no-cache-dir awscli
    - npm install -g @anthropic-ai/claude-code
    # Exchange GitLab OIDC token for AWS credentials
    - export AWS_WEB_IDENTITY_TOKEN_FILE="/tmp/oidc_token"
    - printf "%s" "$CI_JOB_JWT_V2" > "$AWS_WEB_IDENTITY_TOKEN_FILE"
    - >
      aws sts assume-role-with-web-identity
      --role-arn "$AWS_ROLE_TO_ASSUME"
      --role-session-name "gitlab-claude-$(date +%s)"
      --web-identity-token "file://$AWS_WEB_IDENTITY_TOKEN_FILE"
      --duration-seconds 3600 > /tmp/aws_creds.json
    - export AWS_ACCESS_KEY_ID="$(jq -r .Credentials.AccessKeyId /tmp/aws_creds.json)"
    - export AWS_SECRET_ACCESS_KEY="$(jq -r .Credentials.SecretAccessKey /tmp/aws_creds.json)"
    - export AWS_SESSION_TOKEN="$(jq -r .Credentials.SessionToken /tmp/aws_creds.json)"
  script:
    - claude -p "${AI_FLOW_INPUT}" --permission-mode acceptEdits
  variables:
    AWS_REGION: 'us-west-2'
```

## Custom commands and skills extend Claude’s capabilities with reusable workflows

Commands live in `.claude/commands/` (project-scoped) or `~/.claude/commands/` (user-scoped) and are invoked with `/project:command-name` or `/user:command-name`.

A git commit command with context injection:

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Create a git commit with proper formatting
---

# Git Commit Command

## Context

- Current status: !`git status`
- Current diff: !`git diff HEAD`
- Recent commits: !`git log --oneline -10`

## Task

Create a well-formatted git commit with message: $ARGUMENTS
```

The `!` prefix executes bash commands inline, and `$ARGUMENTS` captures all command arguments.

**Skills** (SKILL.md files in `.claude/skills/`) are model-invoked—Claude automatically uses them based on context triggers in the description:

````markdown
---
name: pdf-processing
description: Extract text, fill forms, merge PDFs. Use when working with PDF files or document extraction.
allowed-tools: Read, Write, Bash
---

# PDF Processing Skill

## Quick Start

```python
import pdfplumber
with pdfplumber.open("doc.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

For form filling, see <FORMS.md>.

````
Skills bundle multiple files, scripts, and templates in a directory structure—unlike single-file slash commands. [![](claude-citation:/icon.png?validation=6745CAC8-17A8-4D97-A282-5396F95EF57D&citation=eyJlbmRJbmRleCI6MTI4OTgsIm1ldGFkYXRhIjp7Imljb25VcmwiOiJodHRwczpcL1wvd3d3Lmdvb2dsZS5jb21cL3MyXC9mYXZpY29ucz9zej02NCZkb21haW49YW50aHJvcGljLmNvbSIsInByZXZpZXdUaXRsZSI6IkVxdWlwcGluZyBhZ2VudHMgZm9yIHRoZSByZWFsIHdvcmxkIHdpdGggQWdlbnQgU2tpbGxzIiwic291cmNlIjoiQW50aHJvcGljIiwidHlwZSI6ImdlbmVyaWNfbWV0YWRhdGEifSwic291cmNlcyI6W3siaWNvblVybCI6Imh0dHBzOlwvXC93d3cuZ29vZ2xlLmNvbVwvczJcL2Zhdmljb25zP3N6PTY0JmRvbWFpbj1hbnRocm9waWMuY29tIiwic291cmNlIjoiQW50aHJvcGljIiwidGl0bGUiOiJFcXVpcHBpbmcgYWdlbnRzIGZvciB0aGUgcmVhbCB3b3JsZCB3aXRoIEFnZW50IFNraWxscyIsInVybCI6Imh0dHBzOlwvXC93d3cuYW50aHJvcGljLmNvbVwvZW5naW5lZXJpbmdcL2VxdWlwcGluZy1hZ2VudHMtZm9yLXRoZS1yZWFsLXdvcmxkLXdpdGgtYWdlbnQtc2tpbGxzIn1dLCJzdGFydEluZGV4IjoxMjc4NiwidGl0bGUiOiJBbnRocm9waWMiLCJ1cmwiOiJodHRwczpcL1wvd3d3LmFudGhyb3BpYy5jb21cL2VuZ2luZWVyaW5nXC9lcXVpcHBpbmctYWdlbnRzLWZvci10aGUtcmVhbC13b3JsZC13aXRoLWFnZW50LXNraWxscyIsInV1aWQiOiJmYjI5YjA1Ni01YThjLTQxMDItYjE4OC1jMzMwMzIxMDU2M2QifQ%3D%3D "Anthropic")](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) The description field is critical: Claude uses it to determine when to invoke the skill automatically.

**Subagents** in `.claude/agents/` provide specialized capabilities: [![](claude-citation:/icon.png?validation=6745CAC8-17A8-4D97-A282-5396F95EF57D&citation=eyJlbmRJbmRleCI6MTMwNzEsIm1ldGFkYXRhIjp7Imljb25VcmwiOiJodHRwczpcL1wvd3d3Lmdvb2dsZS5jb21cL3MyXC9mYXZpY29ucz9zej02NCZkb21haW49YW50aHJvcGljLmNvbSIsInByZXZpZXdUaXRsZSI6IlN1YmFnZW50cyAtIEFudGhyb3BpYyIsInNvdXJjZSI6IkFudGhyb3BpYyIsInR5cGUiOiJnZW5lcmljX21ldGFkYXRhIn0sInNvdXJjZXMiOlt7Imljb25VcmwiOiJodHRwczpcL1wvd3d3Lmdvb2dsZS5jb21cL3MyXC9mYXZpY29ucz9zej02NCZkb21haW49YW50aHJvcGljLmNvbSIsInNvdXJjZSI6IkFudGhyb3BpYyIsInRpdGxlIjoiU3ViYWdlbnRzIC0gQW50aHJvcGljIiwidXJsIjoiaHR0cHM6XC9cL2RvY3MuYW50aHJvcGljLmNvbVwvZW5cL2RvY3NcL2NsYXVkZS1jb2RlXC9zdWItYWdlbnRzP2FtcD0mYW1wPSJ9XSwic3RhcnRJbmRleCI6MTMwMDMsInRpdGxlIjoiQW50aHJvcGljIiwidXJsIjoiaHR0cHM6XC9cL2RvY3MuYW50aHJvcGljLmNvbVwvZW5cL2RvY3NcL2NsYXVkZS1jb2RlXC9zdWItYWdlbnRzP2FtcD0mYW1wPSIsInV1aWQiOiIyNTNmZWYxNy04NTFhLTRkMTQtYWNiMi03N2VjZmJlNWE2YzQifQ%3D%3D "Anthropic")](https://docs.anthropic.com/en/docs/claude-code/sub-agents?amp=&amp=)

```yaml
---
name: code-reviewer
description: Expert code reviewer. Use proactively after code changes.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a senior code reviewer ensuring high standards.

Review checklist:
1. Code organization and structure
2. Error handling
3. Performance considerations
4. Security concerns
5. Test coverage
````

## Git worktrees enable parallel Claude sessions without conflicts

Running multiple Claude instances in the same directory causes commits to the same branch. Git worktrees provide isolated file state while sharing history:

```bash
# Create worktree with new branch
git worktree add ../project-feature-a -b feature-a

# Navigate and start Claude
cd ../project-feature-a && claude

# List all worktrees
git worktree list

# Cleanup when done
git worktree remove ../project-feature-a
```

Each worktree needs dependency installation (`npm install`, etc.), but this overhead is justified for complex parallel work.

**GitButler integration** provides an alternative: virtual branches without worktree bootstrapping. Configure hooks in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [{ "type": "command", "command": "but claude pre-tool" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [{ "type": "command", "command": "but claude post-tool" }]
      }
    ],
    "Stop": [
      {
        "hooks": [{ "type": "command", "command": "but claude stop" }]
      }
    ]
  }
}
```

GitButler automatically creates branches per Claude session, sorts changes by session ID, and commits when chat completes—enabling three parallel sessions that produce three mergeable branches without conflicts.

## Settings hierarchy provides granular configuration control

Settings files load in order of precedence:

1. **Managed** (`managed-settings.json`) — Enterprise policies, cannot be overridden
1. **Command line** — Session-specific overrides
1. **Local** (`.claude/settings.local.json`) — Personal project settings, gitignored
1. **Project** (`.claude/settings.json`) — Team settings, committed to git
1. **User** (`~/.claude/settings.json`) — Global personal defaults

A comprehensive settings.json example:

```json
{
  "permissions": {
    "allow": ["Bash(npm run lint)", "Bash(npm run test:*)", "Read(~/.zshrc)"],
    "deny": ["Bash(curl:*)", "Read(./.env)", "Read(./secrets/**)"],
    "defaultMode": "acceptEdits"
  },
  "env": {
    "NODE_ENV": "development"
  },
  "model": "claude-sonnet-4-5-20250929",
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write(*.py)",
        "hooks": [{ "type": "command", "command": "black $file" }]
      }
    ]
  }
}
```

**Sandboxing** (launched November 2025) reduces permission prompts by **84%** through OS-level isolation using Linux bubblewrap and macOS Seatbelt. Enable via `/sandbox` command or settings.

## Context management patterns prevent performance degradation

Performance degrades significantly as context fills—community consensus suggests restarting sessions when context hits **80%**. Auto-compaction triggers at 75%, leaving 25% (approximately 50k tokens) free for reasoning.

Key commands:

- `/clear` — Reset context between tasks (50-70% token savings)
- `/compact` — Manual compaction (avoid if possible—opaque behavior)
- `/context` — View what’s consuming your context window

Token optimization strategies:

- Use `@/src/specific/file.ts` instead of entire directories
- Disable unused MCP servers mid-session with `@server-name disable` (MCP servers consume 8-30% of context)
- One-task sessions: keep conversations under 30K tokens for complex work

A “Document & Clear” pattern for long tasks:

1. Have Claude dump plan and progress into a `.md` file
1. `/clear` the session
1. Start new session pointing to the `.md` file to continue with fresh context

## Community-validated anti-patterns to avoid

**Pattern drift at scale**: GitHub issue #427 documents enterprise teams experiencing erosion of architectural standards—Claude using plain HTML instead of MUI components despite documentation. Hooks provide deterministic enforcement where prompts fail.

**Jumping straight to code**: Always follow Anthropic’s two-step pattern:

1. Ask Claude to read relevant files, explicitly stating “do NOT write code yet”
1. Ask Claude to make a plan using “think”, “think hard”, or “ultrathink”
1. Confirm plan before proceeding

**Custom subagents that gatekeep context**: Creating a PythonTests subagent hides all testing context from the main agent. Instead, use Claude’s built-in `Task(...)` feature for dynamic delegation.

**Ignoring CLAUDE.md rule decay**: LLMs deprioritize early instructions as conversations grow. Use XML format for structured rules, add emphasis (“IMPORTANT”, “YOU MUST”) for critical instructions, and enforce deterministically via hooks.

## Conclusion: configuration as competitive advantage

The most productive Claude Code users treat configuration as infrastructure code—version-controlled, reviewed, and continuously improved based on agent behavior. Key principles: maintain lean CLAUDE.md files under 100 instructions, use hooks for deterministic quality enforcement, leverage parallel sessions via worktrees or GitButler, and manage context aggressively with `/clear` between tasks.

Invest in planning modes before execution—a good plan compounds into hours saved. Use verification loops (tests, type checking, linting) so Claude can iterate toward correctness. And monitor what Claude gets wrong to continuously refine your configuration, creating a flywheel where improved context leads to better agent performance.
