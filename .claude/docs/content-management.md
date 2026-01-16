# Content Management

## Adding a New Painting

1. Add image to `content/paintings/images/` (filename derived from title automatically)
2. Add entry to `content/paintings/paintings.yaml`:

```yaml
- title: Painting Title
  description: Description text
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
  alt: Alt text for accessibility
  order: 1
```

Note: The `id` and image filename are derived automatically from the title.

### Source Image Guidelines

For optimal quality and performance, source images should follow these specifications:

| Property      | Recommendation                       |
| ------------- | ------------------------------------ |
| Format        | JPEG (sRGB color profile)            |
| Dimensions    | 4000-6000px on longest edge          |
| File size     | Up to 8MB acceptable                 |
| Naming        | Auto-derived from title (kebab-case) |
| Color profile | sRGB (Adobe RGB auto-converts)       |

**Why these specs?**

- Sharp/Gatsby handles large images efficiently with streaming processing
- Images are automatically optimized to AVIF/WebP with multiple breakpoints
- Gallery shows 450px thumbnails, detail page shows 1200px, magnifier uses 3000px
- High-res sources ensure quality at all zoom levels

3. (Optional) Add translations in `content/paintings/locales/{lang}/painting-locales.yaml`

## Modifying About Page

Edit the appropriate language file in `content/about/`:

- `content/about/en.md` - English
- `content/about/zh.md` - Chinese (Simplified)
- `content/about/yue.md` - Cantonese

Each file supports Markdown with YAML frontmatter for title, artistName, photo, and locale.

## Site Configuration

Edit `content/site/site.yaml` for invariant site data (name, author, email, url).

UI strings (navigation labels, button text, etc.) are in `locales/{lang}/common.json`.

## Internationalization (i18n)

**Supported Languages**: English (en), Chinese (zh), Cantonese (yue)

**Translation Files**:

- `locales/{lang}/common.json` - Shared UI strings
- `locales/{lang}/about.json` - About page strings
- `locales/{lang}/painting.json` - Painting page strings
- `locales/{lang}/404.json` - 404 page strings
