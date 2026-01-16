# Project Structure

```
src/
├── components/      # Reusable React components with CSS modules
│   └── __tests__/   # Component tests
├── pages/           # Auto-routed Gatsby pages (index, about, 404)
│   └── __tests__/   # Page tests
├── templates/       # Dynamic page templates (painting detail)
├── styles/          # Global CSS (includes dark mode variables)
├── types/           # TypeScript interfaces
├── hooks/           # Custom React hooks (useTheme)
└── utils/           # Utility functions (slug generation)

content/
├── paintings/
│   ├── paintings.yaml       # Painting metadata
│   ├── images/              # Painting image files
│   └── locales/{lang}/      # Painting translations (zh, yue)
├── about/
│   ├── en.md                # English about page
│   ├── zh.md                # Chinese about page
│   └── yue.md               # Cantonese about page
└── site/site.yaml           # Site configuration

locales/                     # UI translation strings
├── en/                      # English translations
├── zh/                      # Chinese translations
└── yue/                     # Cantonese translations

Key config files:
- gatsby-config.js   # Gatsby plugins and site metadata
- gatsby-node.ts     # Dynamic page generation for paintings
- tsconfig.json      # TypeScript configuration
- jest.config.js     # Jest test configuration
```

## Available Mocks for Testing

- `__mocks__/gatsby.js` - Gatsby APIs (Link, graphql, navigate)
- `__mocks__/gatsby-plugin-image.js` - Image components
- `__mocks__/gatsby-plugin-react-i18next.js` - i18n hooks
- `__mocks__/ThemeContext.tsx` - Theme context provider
- `__mocks__/drift-zoom.js` - Image magnifier library
- `__mocks__/styleMock.js` - CSS imports
- `__mocks__/fileMock.js` - Static file imports
