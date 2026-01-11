# Reduce Painting Metadata Duplication

## Problem

Currently `en.yaml` and `zh.yaml` duplicate ~80% of data. Only `description` and `alt` differ between languages, but all invariant fields (dimensions, medium, substrate, year, order) are maintained in both files.

**Risk**: Inconsistent data if someone updates dimensions in one file but not the other.

---

## Solution: Single Source of Truth + Locale Overrides

### New File Structure

```
content/paintings/
├── paintings.yaml       # All invariant data + English defaults
├── locales/
│   └── zh.yaml          # Only Chinese description + alt
└── images/
    └── *.jpeg
```

**Key principle**: English is the default. Only non-English locales need override files.

---

## New YAML Formats

### `paintings.yaml` (invariant + English defaults)

```yaml
paintings:
  - title: Symbiosis
    description: An exploration of organic forms... # English default
    alt: Abstract painting of hands... # English default
    dimensions:
      width: 45.5
      height: 35.5
      unit: cm
    substrate: canvas
    substrateSize:
      width: 45.5
      height: 35.5
      unit: cm
    medium: acrylic
    year: '2020'
    order: 1
```

### `locales/zh.yaml` (Chinese overrides only)

```yaml
paintings:
  - title: Symbiosis # Match key
    description: 探索有机形态和鲜艳色彩...
    alt: 手部抽象画，蓝色、红色...
```

---

## Implementation Changes

### 1. Update `gatsby-config.js`

Add separate source for locale overrides:

```javascript
// Add after existing content source
{
  resolve: `gatsby-source-filesystem`,
  options: {
    name: `paintingLocales`,
    path: `${__dirname}/content/paintings/locales`,
  },
},
```

### 2. Update `gatsby-node.ts`

Replace current YAML processing with merge logic:

```typescript
// In createPages:
const baseResult = await graphql(`
  query {
    paintingsYaml {
      paintings {
        title
        description
        alt
        dimensions {
          width
          height
          unit
        }
        substrate
        substrateSize {
          width
          height
          unit
        }
        medium
        year
        order
      }
    }
  }
`)

const localeResult = await graphql(`
  query {
    allPaintingLocalesYaml {
      nodes {
        paintings {
          title
          description
          alt
        }
        parent {
          ... on File {
            name
          }
        }
      }
    }
  }
`)

// Build locale override maps
const localeOverrides = new Map<string, Map<string, LocaleFields>>()
localeResult.data?.allPaintingLocalesYaml.nodes.forEach((node) => {
  const locale = node.parent?.name
  const overrideMap = new Map()
  node.paintings?.forEach((p) => {
    overrideMap.set(p.title, { description: p.description, alt: p.alt })
  })
  localeOverrides.set(locale, overrideMap)
})

// Merge for each language
LANGUAGES.forEach((lang) => {
  const basePaintings = baseResult.data?.paintingsYaml?.paintings || []
  const overrides = localeOverrides.get(lang)

  const paintings = basePaintings.map((base) => {
    const override = overrides?.get(base.title)
    return {
      ...base,
      description: override?.description || base.description,
      alt: override?.alt || base.alt,
    }
  })

  // Create pages with merged data...
})
```

### 3. Update `createSchemaCustomization`

Add type for locale files:

```typescript
type PaintingLocalesYamlPaintings {
  title: String!
  description: String
  alt: String
}
```

### 4. Update `onPostBuild` EXIF injection

Change path from `en.yaml` to `paintings.yaml`:

```typescript
const paintingsYamlPath = path.join(
  __dirname,
  'content/paintings/paintings.yaml'
)
```

### 5. Migrate Data

1. Rename `en.yaml` to `paintings.yaml`
2. Create `locales/` directory
3. Create `locales/zh.yaml` with only title, description, alt fields
4. Delete old `zh.yaml`

### 6. Update Tests

Update mock data structure in:

- `src/pages/__tests__/index.test.tsx`
- `src/templates/__tests__/painting.test.tsx`

---

## Files to Modify

| File                        | Change                                                     |
| --------------------------- | ---------------------------------------------------------- |
| `gatsby-config.js`          | Add paintingLocales source                                 |
| `gatsby-node.ts`            | Implement merge logic, update schema                       |
| `content/paintings/en.yaml` | Rename to `paintings.yaml`                                 |
| `content/paintings/zh.yaml` | Move to `locales/zh.yaml`, keep only title/description/alt |
| Test files                  | Update mock structures                                     |

---

## Benefits

1. **Single source of truth** for dimensions, medium, substrate, year, order
2. **No risk of inconsistency** - invariant data defined once
3. **Easy to add languages** - just add a new locale override file
4. **Easy to add paintings** - add to paintings.yaml, then add translations
5. **Smaller locale files** - ~70% less content to translate/maintain

---

## Migration Checklist

- [ ] Add paintingLocales filesystem source
- [ ] Update createSchemaCustomization with locale type
- [ ] Implement merge logic in createPages
- [ ] Update onPostBuild to use paintings.yaml
- [ ] Rename en.yaml to paintings.yaml
- [ ] Create locales/zh.yaml with only translatable fields
- [ ] Delete old zh.yaml
- [ ] Update tests
- [ ] Verify build and tests pass
