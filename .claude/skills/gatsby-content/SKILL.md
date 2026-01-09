---
name: gatsby-content
description: Manage content for the Lulu Tracy art portfolio. Use this skill when adding new paintings to the gallery, updating painting metadata, editing the about page, or modifying site configuration. Handles YAML and Markdown content files.
---

# Gatsby Content Management

Assist with adding and managing content in this Gatsby art portfolio site.

## Adding a New Painting

### Step 1: Verify the Image

1. Confirm image file exists in `content/paintings/images/`
2. Supported formats: JPG, PNG, WebP
3. Recommended: High resolution (at least 1200px on longest side)

### Step 2: Determine Order Value

Check existing paintings in `content/paintings/index.yaml` and find the maximum `order` value. New paintings typically get `order: <max + 1>` unless specific placement is requested.

### Step 3: Add YAML Entry

Add to `content/paintings/index.yaml`:

```yaml
- id: unique-kebab-case-slug
  title: Painting Title
  description: >-
    A detailed description of the painting. Can span
    multiple lines using YAML block scalar.
  dimensions: '16" x 20"'
  canvasSize: 16x20
  medium: Watercolor on paper
  year: '2024'
  image: ./images/filename.jpg
  alt: Descriptive alt text for screen readers
  order: 1
```

### Required Fields

| Field         | Format                 | Example                    |
| ------------- | ---------------------- | -------------------------- |
| `id`          | kebab-case, unique     | `autumn-leaves`            |
| `title`       | Title case             | `Autumn Leaves`            |
| `description` | Plain text             | `A vibrant fall scene...`  |
| `dimensions`  | `W" x H"` format       | `16" x 20"`                |
| `canvasSize`  | `WxH` (no spaces)      | `16x20`                    |
| `medium`      | Art medium description | `Watercolor on paper`      |
| `year`        | String (quoted)        | `'2024'`                   |
| `image`       | Relative path          | `./images/file.jpg`        |
| `alt`         | Accessibility text     | `Colorful maple leaves...` |
| `order`       | Integer                | `5`                        |

### Step 4: Validate

```bash
make build  # Verify GraphQL picks up the new content
make test   # Ensure no regressions
```

## Editing the About Page

Edit `content/about.md`:

```markdown
---
title: About the Artist
artistName: Lulu Tracy
photo: ../src/images/about-photo.jpg
---

Markdown content here...
```

- Frontmatter fields are required
- Body supports full Markdown syntax
- Photo path is relative to the content directory

## Site Configuration

Edit `content/site.yaml` for:

- Site title and description
- Navigation items
- Social media links
- Copyright text

## Common Issues

**Painting not showing**: Check that `id` is unique and `image` path is correct.

**Build fails**: Verify YAML syntax (proper indentation, quoted strings where needed).

**Image not processing**: Ensure image is in `content/paintings/images/` (not elsewhere).
