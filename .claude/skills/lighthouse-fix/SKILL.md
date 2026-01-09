---
name: lighthouse-fix
description: Diagnose and fix Lighthouse audit failures for performance, accessibility, SEO, and best practices. Use this skill when CI reports low Lighthouse scores or when optimizing the site's Core Web Vitals.
---

# Lighthouse Performance Optimization

Guide fixes for Lighthouse audit issues in this Gatsby portfolio site.

## Performance Targets

This project enforces these Lighthouse thresholds in CI:

| Category       | Target |
| -------------- | ------ |
| Performance    | 90+    |
| Accessibility  | 90+    |
| Best Practices | 90+    |
| SEO            | 90+    |

## Common Performance Issues

### Large Images (LCP)

**Problem**: Largest Contentful Paint is slow due to unoptimized images.

**Solution**: Use Gatsby Image properly:

```tsx
// For dynamic images from GraphQL
import { GatsbyImage, getImage } from 'gatsby-plugin-image'

const image = getImage(data.file.childImageSharp.gatsbyImageData)
return <GatsbyImage image={image} alt="description" loading="eager" />

// For hero/above-fold images, use loading="eager"
// For below-fold images, use loading="lazy" (default)
```

**Check**: Ensure images in `content/paintings/images/` are reasonable sizes (under 2MB source).

### Layout Shift (CLS)

**Problem**: Cumulative Layout Shift from images loading without dimensions.

**Solution**: GatsbyImage handles this automatically. If using regular `<img>`:

```tsx
// Always specify width and height
<img src={src} alt="desc" width={800} height={600} />
```

### Render-Blocking Resources

**Problem**: CSS or fonts blocking initial render.

**Solution**:

- CSS Modules are automatically code-split
- For fonts, use `font-display: swap` in CSS
- Critical CSS is inlined by Gatsby

## Accessibility Fixes

### Missing Alt Text

**Problem**: Images without alt attributes.

**Solution**: Every image must have `alt`:

```tsx
// Decorative images
<GatsbyImage image={image} alt="" />

// Meaningful images
<GatsbyImage image={image} alt="Watercolor painting of autumn leaves" />
```

For paintings, alt text comes from `content/paintings/index.yaml`.

### Color Contrast

**Problem**: Text doesn't meet WCAG contrast ratios.

**Solution**: Check contrast in `src/styles/global.css`:

```css
/* Minimum contrast ratios */
/* Normal text: 4.5:1 */
/* Large text (18px+ or 14px+ bold): 3:1 */

/* Example fix */
.text {
  color: #333; /* Darker than #666 for better contrast */
  background: #fff;
}
```

### Missing Labels

**Problem**: Form inputs or buttons without accessible names.

**Solution**:

```tsx
// Buttons with icons need aria-label
<button aria-label="Open menu" onClick={onMenuToggle}>
  <MenuIcon />
</button>

// Or use visually hidden text
<button onClick={onMenuToggle}>
  <MenuIcon />
  <span className="visually-hidden">Open menu</span>
</button>
```

### Keyboard Navigation

**Problem**: Interactive elements not keyboard accessible.

**Solution**:

- Use semantic HTML (`<button>`, `<a>`, not `<div onClick>`)
- Ensure focus states are visible in CSS
- Test with Tab key navigation

## SEO Fixes

### Missing Meta Description

**Problem**: Page lacks meta description.

**Solution**: Check `gatsby-config.js` siteMetadata and use Gatsby Head API:

```tsx
export const Head = () => (
  <>
    <title>Page Title | Lulu Tracy</title>
    <meta name="description" content="Description here" />
  </>
)
```

### Missing Title

**Problem**: Page title missing or generic.

**Solution**: Each page should export a Head component with unique title.

### Non-Crawlable Links

**Problem**: Links using JavaScript instead of href.

**Solution**: Use Gatsby Link properly:

```tsx
import { Link } from 'gatsby'

// Correct
<Link to="/about">About</Link>

// Incorrect
<span onClick={() => navigate('/about')}>About</span>
```

## Best Practices Fixes

### Console Errors

**Problem**: JavaScript errors in console.

**Solution**: Run `make dev` and check browser console. Fix any React warnings or errors.

### HTTPS Issues

**Problem**: Mixed content or insecure resources.

**Solution**: All external resources should use HTTPS. Check for hardcoded HTTP URLs.

### Vulnerable Libraries

**Problem**: Dependencies with known vulnerabilities.

**Solution**:

```bash
npm audit
npm audit fix
```

## Debugging Lighthouse Locally

```bash
# Build production version
make build

# Serve locally
make serve

# Run Lighthouse CLI (install globally first)
npx lighthouse http://localhost:9000 --view
```

## Image Optimization Checklist

1. Source images are high quality but reasonable size (<2MB)
2. Using GatsbyImage for all dynamic images
3. Using StaticImage for known static images
4. Alt text provided for all images
5. Hero images use `loading="eager"`
6. Gallery images use default lazy loading

## Quick Wins

1. **Add `loading="eager"` to above-fold images**
2. **Ensure all images have alt text**
3. **Use semantic HTML elements**
4. **Add meta descriptions to all pages**
5. **Fix any console errors/warnings**
