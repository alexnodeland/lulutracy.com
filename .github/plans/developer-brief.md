# Developer Brief: Lulu Tracy Art Portfolio

## Project Summary

Rebuild an existing art portfolio website for artist Lulu Tracy. The client has provided screenshots and assets from the original site. The goal is pixel-perfect recreation of the original design and functionality.

——

## Tech Stack Recommendations

|Layer |Suggested Options |
|—————|———————————————————|
|Framework |Next.js, Astro, or SvelteKit |
|Styling |Tailwind CSS or CSS Modules |
|Image Handling|Next/Image, sharp, or similar optimization |
|Magnifier |react-image-magnify, drift-zoom, or custom implementation|
|Deployment |Vercel, Netlify, or similar static hosting |

> **Note:** Final tech decisions should align with client preferences and maintainability requirements.

——

## Site Structure

```
/
├── index.html (or equivalent)     # Homepage - Gallery
├── /painting/[id]                 # Dynamic painting detail pages
├── /about                         # About the artist
└── /assets
    ├── /images
    │   ├── /paintings             # High-res artwork
    │   └── /ui                    # Logo, icons, artist photo
    └── /fonts (if custom)
```

——

## Component Architecture

### Layout Components

#### `<Header />`

```
┌─────────────────────────────────────────────┐
│ [Logo]                        [Hamburger ☰] │
└─────────────────────────────────────────────┘
```

- **Props:** None (static)
- **Behavior:**
  - Logo: `<a href=“/“>` — always routes to homepage
  - Hamburger: Toggles `<NavigationMenu />` visibility
- **Position:** Fixed or sticky top

#### `<NavigationMenu />`

- **State:** Open/closed (controlled by hamburger)
- **Links:**
  - Home → `/`
  - About → `/about`
- **Animation:** Match original (fade, slide, etc.)
- **Dismiss:** Click outside, click X, or ESC key

#### `<Footer />`

- **Content:** Extract from screenshots
- **Position:** Page bottom, consistent across all pages

——

### Page Components

#### Homepage: `<Gallery />`

```
┌─────────────────────────────────────────────┐
│              [Header]                       │
├─────────────────────────────────────────────┤
│                                             │
│            ┌─────────────────┐              │
│            │   Painting 1    │ ← clickable  │
│            └─────────────────┘              │
│                                             │
│            ┌─────────────────┐              │
│            │   Painting 2    │ ← clickable  │
│            └─────────────────┘              │
│                                             │
│            ┌─────────────────┐              │
│            │   Painting 3    │ ← clickable  │
│            └─────────────────┘              │
│                    ...                      │
│                                             │
├─────────────────────────────────────────────┤
│              [Footer]                       │
└─────────────────────────────────────────────┘
```

- **Data:** Array of painting objects
- **Rendering:** Map over paintings, render `<GalleryImage />` for each
- **Layout:** Single column, centered, vertical scroll
- **No text:** Images only in the feed

#### `<GalleryImage />`

- **Props:** `{ id, src, alt }`
- **Behavior:** Click navigates to `/painting/[id]`
- **Styling:** Consistent spacing, responsive width
- **Optimization:** Lazy loading, srcset for responsive images

——

#### Painting Detail: `<PaintingDetail />`

```
┌─────────────────────────────────────────────┐
│              [Header]                       │
├─────────────────────────────────────────────┤
│                                             │
│    ┌───────────────────────────────┐        │
│    │                               │        │
│    │      [Painting Image]         │        │
│    │      with hover magnifier     │        │
│    │                               │        │
│    └───────────────────────────────┘        │
│                                             │
│    Title: “Painting Name”                   │
│    Description: Lorem ipsum...              │
│    Dimensions: 24 × 36 inches               │
│    Medium: Oil on canvas                    │
│                                             │
├─────────────────────────────────────────────┤
│              [Footer]                       │
└─────────────────────────────────────────────┘
```

#### `<ImageMagnifier />`

- **Trigger:** Mouse hover (desktop), tap-and-hold (mobile consideration)
- **Behavior:** Displays zoomed portion following cursor
- **Implementation options:**
  - Lens overlay on image
  - Side panel with zoomed view
  - Inline zoom (image expands under cursor)
- **Performance:** Use high-res source, consider progressive loading

#### `<PaintingMetadata />`

- **Props:** `{ title, description, dimensions, medium }`
- **Layout:** Match original positioning (below image, side panel, etc.)

——

#### About Page: `<About />`

```
┌─────────────────────────────────────────────┐
│              [Header]                       │
├─────────────────────────────────────────────┤
│                                             │
│    ┌──────────┐                             │
│    │  Photo   │  Biography paragraph...     │
│    └──────────┘  Continues here with more   │
│                  text about the artist.     │
│                                             │
├─────────────────────────────────────────────┤
│              [Footer]                       │
└─────────────────────────────────────────────┘
```

- **Layout:** Photo + text arrangement (reference screenshots)
- **Content:** Static, from provided copy

——

## Data Structure

### Painting Object

```typescript
interface Painting {
  id: string
  title: string
  description: string
  dimensions: string
  medium: string
  image: {
    thumbnail: string // For gallery (optimized)
    full: string // For detail view
    highRes: string // For magnifier
  }
  alt: string
  order: number // Display order in gallery
}
```

### Data Storage Options

- **Static JSON:** `/data/paintings.json`
- **Headless CMS:** If client needs to update content (Sanity, Contentful, etc.)
- **Markdown files:** With frontmatter for each painting

——

## Implementation Notes

### Image Optimization

1. Generate multiple sizes for responsive loading
1. Use modern formats (WebP, AVIF) with fallbacks
1. Implement lazy loading for gallery
1. Preload high-res images on detail page for smooth magnifier

### Magnifier Implementation

```javascript
// Pseudocode for hover magnifier
onMouseMove(e) {
  const { x, y } = getCursorPosition(e);
  const zoomLevel = 2.5; // Adjust based on original
  updateMagnifierPosition(x, y);
  updateMagnifierContent(x, y, zoomLevel);
}
```

### Responsive Breakpoints

|Breakpoint |Consideration |
|-——————|———————————|
|Mobile (<768px) |Full-width images, stacked layout|
|Tablet (768-1024px)|Padded images, adjusted spacing |
|Desktop (>1024px) |Match original desktop layout |

### Navigation State Management

- Menu open/close state
- Consider URL-based routing for back button support
- Preserve scroll position when returning to gallery

——

## Deliverables Checklist

### Phase 1: Setup

- [ ] Project scaffolding
- [ ] Asset organization
- [ ] Design token extraction (colors, fonts, spacing)

### Phase 2: Core Components

- [ ] Header with logo and hamburger
- [ ] Navigation menu (open/close)
- [ ] Footer
- [ ] Page layout wrapper

### Phase 3: Homepage

- [ ] Gallery layout
- [ ] Image components with click handling
- [ ] Lazy loading implementation

### Phase 4: Detail View

- [ ] Painting detail page
- [ ] Magnifier functionality
- [ ] Metadata display

### Phase 5: About Page

- [ ] Layout matching original
- [ ] Photo and text content

### Phase 6: Polish

- [ ] Responsive testing
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Accessibility audit

——

## Questions for Client

1. **Tech preferences:** Any existing tech stack or hosting requirements?
1. **Content updates:** Will you need to add/edit paintings yourself? (CMS consideration)
1. **Magnifier style:** Lens overlay, side panel, or inline zoom?
1. **Mobile magnifier:** How should zoom work on touch devices?
1. **Analytics:** Do you need visitor tracking?
1. **Domain/hosting:** Existing domain to point to?

——

## Reference Assets Required

- [ ] All screenshots from original site
- [ ] High-resolution painting images
- [ ] Logo file (SVG preferred)
- [ ] Artist photo
- [ ] Complete painting metadata (spreadsheet or document)
- [ ] Any custom fonts used
- [ ] Footer content/links
