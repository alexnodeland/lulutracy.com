---
name: gatsby-content
description: Manage content for the lulutracy art portfolio. Use this skill when adding new paintings to the gallery, updating painting metadata, editing the about page, or modifying site configuration. Handles YAML and Markdown content files with i18n support.
allowed-tools: Read, Write, Edit, Bash(ls:*), Bash(make build)
---

# Gatsby Content Management

Assist with adding and managing content in this Gatsby art portfolio site.

## Adding a New Painting

### Step 1: Verify the Image

1. Confirm image file exists in `content/paintings/images/`
2. Filename is derived from painting title (e.g., "Night Hours" → `night-hours.jpg`)
3. Supported formats: JPG, PNG, WebP
4. Recommended: High resolution (at least 1200px on longest side)

### Step 2: Determine Order Value

Check existing paintings in `content/paintings/paintings.yaml` and find the maximum `order` value. New paintings typically get `order: <max + 1>` unless specific placement is requested.

### Step 3: Add YAML Entry

Add to `content/paintings/paintings.yaml`:

```yaml
- title: Painting Title
  description: >-
    A detailed description of the painting. Can span
    multiple lines using YAML block scalar.
  dimensions:
    width: 40.6
    height: 50.8
    unit: cm
  substrate: canvas
  substrateSize:
    width: 40.6
    height: 50.8
    unit: cm
  medium: acrylic
  year: '2024'
  alt: Descriptive alt text for screen readers
  order: 1
```

Note: The `id` and image filename are derived automatically from the title.

### Required Fields

| Field           | Format                        | Example                                   |
| --------------- | ----------------------------- | ----------------------------------------- |
| `title`         | Title case                    | `Autumn Leaves`                           |
| `description`   | Plain text                    | `A vibrant fall scene...`                 |
| `dimensions`    | Object with width/height/unit | `{ width: 40.6, height: 50.8, unit: cm }` |
| `substrate`     | String (canvas, paper, etc.)  | `canvas`                                  |
| `substrateSize` | Object with width/height/unit | `{ width: 40.6, height: 50.8, unit: cm }` |
| `medium`        | Art medium description        | `acrylic`                                 |
| `year`          | String (quoted)               | `'2024'`                                  |
| `alt`           | Accessibility text            | `Colorful maple leaves...`                |
| `order`         | Integer                       | `5`                                       |

### Step 4: Add Translations (Optional)

For non-English translations, add entries to `content/paintings/locales/{lang}/painting-locales.yaml`:

```yaml
# content/paintings/locales/zh/painting-locales.yaml
paintings:
  - id: painting-title # kebab-case of original title
    title: 中文标题
    description: 中文描述
    alt: 中文替代文本
```

### Step 5: Validate

```bash
make build  # Verify GraphQL picks up the new content
make test   # Ensure no regressions
```

## Editing the About Page

About pages are internationalized. Edit the appropriate language file in `content/about/`:

- `content/about/en.md` - English
- `content/about/zh.md` - Chinese (Simplified)
- `content/about/yue.md` - Cantonese

```markdown
---
title: About
artistName: ';-)'
photo: about.jpeg
locale: en
---

Markdown content here...
```

- `locale` field must match the filename language code
- Photo path is relative to the about directory
- Body supports full Markdown syntax

## Site Configuration

### Invariant Data

Edit `content/site/site.yaml` for data that doesn't change by language:

```yaml
site:
  name: lulutracy
  author: Tracy Mah
  email: tracy@lulutracy.com
  url: https://our-nature.github.io/lulutracy.com
```

### UI Translations

Edit `locales/{lang}/common.json` for navigation, buttons, and other UI text:

```json
{
  "nav": {
    "about": "about",
    "home": "lulutracy"
  },
  "theme": {
    "switchToDark": "Switch to dark mode",
    "switchToLight": "Switch to light mode"
  }
}
```

**Translation files by namespace:**

- `common.json` - Shared UI strings (nav, buttons)
- `about.json` - About page specific strings
- `painting.json` - Painting detail page strings
- `404.json` - 404 page strings

## Supported Languages

| Code  | Language             |
| ----- | -------------------- |
| `en`  | English (default)    |
| `zh`  | Chinese (Simplified) |
| `yue` | Cantonese            |

## Common Issues

**Painting not showing**: Check that the image filename matches the kebab-case of the title.

**Build fails**: Verify YAML syntax (proper indentation, quoted strings where needed).

**Image not processing**: Ensure image is in `content/paintings/images/` (not elsewhere).

**Translation not appearing**: Verify the `locale` field matches the filename and the language code is correct.
