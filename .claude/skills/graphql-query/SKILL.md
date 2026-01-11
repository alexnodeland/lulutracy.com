---
name: graphql-query
description: Write and debug Gatsby GraphQL queries for this portfolio site. Use this skill when fetching painting data, images, site configuration, or any content from the data layer. Covers page queries, static queries, and schema exploration.
allowed-tools: Read, Write, Edit, Bash(make dev), Bash(make clean)
---

# Gatsby GraphQL Queries

Assist with writing and debugging GraphQL queries for this Gatsby site.

## GraphQL Playground

Access the GraphQL explorer during development:

```
http://localhost:8000/___graphql
```

Use this to explore the schema and test queries.

## Data Sources

This site has these data sources configured in `gatsby-config.js`:

| Source                          | Content             | GraphQL Type         |
| ------------------------------- | ------------------- | -------------------- |
| `content/paintings/paintings.yaml` | Painting metadata | `allPaintingsYaml`   |
| `content/paintings/images/`     | Painting images     | `allFile` (filtered) |
| `content/about/{lang}.md`       | About pages (i18n)  | `allMarkdownRemark`  |
| `content/site/site.yaml`        | Site config         | `siteYaml`           |
| `locales/{lang}/*.json`         | UI translations     | `allLocale`          |
| `src/images/`                   | Static images       | `allFile`            |

## Common Queries

### Fetch All Paintings

```graphql
query AllPaintings {
  allPaintingsYaml {
    nodes {
      paintings {
        id
        title
        description
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
        alt
        order
      }
    }
  }
}
```

### Fetch Painting Images

```graphql
query PaintingImages {
  allFile(
    filter: {
      sourceInstanceName: { eq: "paintingImages" }
      extension: { regex: "/(jpg|jpeg|png|webp)/" }
    }
  ) {
    nodes {
      relativePath
      childImageSharp {
        gatsbyImageData(
          width: 800
          placeholder: BLURRED
          formats: [AUTO, WEBP, AVIF]
        )
      }
    }
  }
}
```

### Fetch About Page (with i18n)

```graphql
query AboutPage($locale: String!) {
  markdownRemark(
    frontmatter: { locale: { eq: $locale } }
    fileAbsolutePath: { regex: "/content/about/" }
  ) {
    frontmatter {
      title
      artistName
      photo
      locale
    }
    html
  }
}
```

### Fetch Site Configuration

```graphql
query SiteConfig {
  siteYaml {
    site {
      name
      author
      email
      url
    }
  }
}
```

### Fetch Single Image by Name

```graphql
query SingleImage {
  file(relativePath: { eq: "logo.png" }) {
    childImageSharp {
      gatsbyImageData(width: 200, placeholder: BLURRED)
    }
  }
}
```

### Fetch Localized Strings

```graphql
query Locales($language: String!) {
  locales: allLocale(filter: { language: { eq: $language } }) {
    edges {
      node {
        ns
        data
        language
      }
    }
  }
}
```

## Query Types

### Page Queries

Used in page components. Has access to page context variables.

```tsx
// src/pages/index.tsx
import { graphql, PageProps } from 'gatsby'

const IndexPage = ({ data }: PageProps<Queries.IndexPageQuery>) => {
  // Use data here
}

export const query = graphql`
  query IndexPage {
    allPaintingsYaml {
      nodes {
        paintings {
          id
          title
          dimensions {
            width
            height
            unit
          }
        }
      }
    }
  }
`

export default IndexPage
```

### Static Queries

Used in non-page components. Cannot accept variables.

```tsx
import { useStaticQuery, graphql } from 'gatsby'

const Header = () => {
  const data = useStaticQuery(graphql`
    query HeaderQuery {
      siteYaml {
        site {
          name
        }
      }
    }
  `)

  return <h1>{data.siteYaml.site.name}</h1>
}
```

### Template Queries with Context

Used in templates created by `gatsby-node.ts`. Receives context variables.

```tsx
// src/templates/painting.tsx
import { graphql, PageProps } from 'gatsby'

const PaintingTemplate = ({ data }: PageProps<Queries.PaintingQuery>) => {
  // data.paintingsYaml contains the specific painting
}

export const query = graphql`
  query Painting($id: String!) {
    paintingsYaml(paintings: { elemMatch: { id: { eq: $id } } }) {
      paintings {
        id
        title
        dimensions {
          width
          height
          unit
        }
        # ... other fields
      }
    }
  }
`
```

## Image Query Options

### gatsbyImageData Parameters

```graphql
childImageSharp {
  gatsbyImageData(
    width: 800                    # Max width
    height: 600                   # Max height (optional)
    layout: CONSTRAINED           # FIXED, FULL_WIDTH, or CONSTRAINED
    placeholder: BLURRED          # BLURRED, DOMINANT_COLOR, TRACED_SVG, NONE
    formats: [AUTO, WEBP, AVIF]   # Output formats
    quality: 80                   # Compression quality (1-100)
    transformOptions: {
      fit: COVER                  # COVER, CONTAIN, FILL, INSIDE, OUTSIDE
      cropFocus: CENTER           # Where to crop
    }
  )
}
```

### Layout Options

| Layout        | Use Case                             |
| ------------- | ------------------------------------ |
| `CONSTRAINED` | Most images - scales down but not up |
| `FIXED`       | Icons, thumbnails with exact size    |
| `FULL_WIDTH`  | Hero images spanning container       |

## Debugging Queries

### Query Returns Empty

1. Check source file exists and has correct format
2. Verify `gatsby-source-filesystem` config in `gatsby-config.js`
3. Run `make clean && make dev` to rebuild schema
4. Check GraphQL playground for available fields

### Field Not Found

1. Check exact field name in playground
2. YAML fields become camelCase in GraphQL
3. Nested fields (like `dimensions`) need explicit selection of child fields

### Image Not Processing

1. Image must be in a sourced directory
2. File extension must be supported (jpg, png, webp, etc.)
3. Sharp must be installed: `npm rebuild sharp`

## Combining Paintings with Images

The index page combines painting data with image files:

```tsx
export const query = graphql`
  query IndexPage {
    allPaintingsYaml {
      nodes {
        paintings {
          id
          title
          alt
          dimensions {
            width
            height
            unit
          }
          # ... other fields
        }
      }
    }
    allFile(filter: { sourceInstanceName: { eq: "paintingImages" } }) {
      nodes {
        relativePath
        childImageSharp {
          gatsbyImageData(width: 800, placeholder: BLURRED)
        }
      }
    }
  }
`

// Image filename is derived from painting title (kebab-case)
// e.g., "Night Hours" → "night-hours.jpg"
const getImageForPainting = (painting, imageNodes) => {
  const expectedFilename = painting.id // id is kebab-case of title
  return imageNodes.find((node) =>
    node.relativePath.startsWith(expectedFilename)
  )
}
```

## Schema Reference

Run this in GraphQL playground to see full schema:

```graphql
{
  __schema {
    types {
      name
      fields {
        name
      }
    }
  }
}
```

## i18n Query Patterns

For pages with i18n support, use the language from page context:

```tsx
export const query = graphql`
  query AboutPage($language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
    markdownRemark(
      frontmatter: { locale: { eq: $language } }
      fileAbsolutePath: { regex: "/content/about/" }
    ) {
      frontmatter {
        title
        artistName
        photo
      }
      html
    }
  }
`
```
