---
allowed-tools: Bash(git:*)
argument-hint: [message]
description: Create a conventional commit with proper formatting
---

# Commit Command

Create a well-formatted conventional commit.

## Context

- Current status: !`git status --short`
- Current diff: !`git diff --stat HEAD`
- Recent commits: !`git log --oneline -5`

## Commit Format

Use Conventional Commits format: `type(scope): subject`

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, deps

Rules:

- Subject must be lowercase
- No period at end
- Max 72 characters in header
- Use imperative mood ("add" not "added")

## Task

Create a commit with message: $ARGUMENTS

If no message provided, analyze the changes and suggest an appropriate commit message.
