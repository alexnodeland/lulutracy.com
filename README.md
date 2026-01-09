# Lulu Tracy Art Portfolio

Art portfolio showcasing watercolor and acrylic paintings by Lulu Tracy.

**Live Site**: https://alexnodeland.github.io/lulutracy.com

## Maintenance

This project is maintained via **Claude Code Web** and **GitHub**. No local setup required.

### Add a Painting

1. Upload image to `content/paintings/images/`
2. Add entry to `content/paintings/index.yaml`:

```yaml
- id: painting-slug
  title: Painting Title
  description: Brief description
  dimensions: '16" x 20"'
  canvasSize: '16 x 20 in'
  medium: Watercolor on paper
  year: '2024'
  image: filename.jpeg
  alt: Alt text for accessibility
  order: 10
```

3. Commit to main (auto-deploys) or open a PR

### Other Content

- **About page**: Edit `content/about.md`
- **Site settings**: Edit `content/site.yaml`

### Code Changes

For component or style changes, see [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## Claude Code

Pre-configured skills for common tasks:

| Command                | Purpose                     |
| ---------------------- | --------------------------- |
| `/gatsby-content`      | Add paintings, edit content |
| `/component-generator` | Create React components     |
| `/test-writer`         | Write Jest tests            |
| `/lighthouse-fix`      | Fix performance issues      |

## Local Development

```bash
npm install         # First time only
make dev            # Dev server at localhost:8000
make build          # Production build
make test           # Run tests
make ci             # Full CI pipeline
```

Requires Node.js 18+.

## License

Artwork copyrighted by Lulu Tracy. Code available for reference.
