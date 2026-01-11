---
allowed-tools: Read, Write, Edit, Bash(ls:*), Bash(make build)
argument-hint: <title>
description: Add a new painting to the gallery
---

# Add Painting Command

Add a new painting entry to the gallery.

## Context

- Current paintings: !`ls content/paintings/images/`
- Existing entries: !`cat content/paintings/paintings.yaml | head -50`

## Task

Add a new painting with title: $ARGUMENTS

Steps:
1. Generate the kebab-case ID from the title
2. Check if an image exists in `content/paintings/images/` matching the ID
3. Add the entry to `content/paintings/paintings.yaml` with proper structure
4. If no image exists, inform the user they need to upload one first
