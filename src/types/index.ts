// Dimension types for structured measurements
export type DimensionUnit = 'cm' | 'in' | 'mm'

export interface Dimensions {
  width: number
  height: number
  unit: DimensionUnit
}

// Painting types
export interface Painting {
  id: string
  title: string
  description: string
  dimensions: Dimensions
  substrate: string
  substrateSize: Dimensions
  medium: string
  year: string
  image: string
  alt: string
  order: number
}

// Site configuration types
export interface SiteConfig {
  title: string
  description: string
  author: string
  url: string
  copyright: string
}

export interface NavigationItem {
  label: string
  path: string
}

// Component props types
export interface HeaderProps {
  onMenuToggle: () => void
  isMenuOpen?: boolean
}

export interface NavigationProps {
  isOpen: boolean
  onClose: () => void
}

export interface LayoutProps {
  children: React.ReactNode
}

export interface GalleryImageProps {
  painting: Painting
  image: any // Gatsby image data
}

export interface PaintingDetailProps {
  painting: Painting
  image: any // Gatsby image data
}

// GraphQL query types
export interface PaintingsYamlNode {
  paintings: Painting[]
}

export interface AboutMarkdownNode {
  frontmatter: {
    title: string
    artistName: string
    photo: string
    locale?: string
  }
  html: string
}

// Theme types
export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

// i18n types
export interface I18nPageContext {
  language: string
  languages: readonly string[]
  defaultLanguage: string
  originalPath: string
  routed: boolean
}

export interface LocaleNode {
  ns: string
  data: string
  language: string
}

export interface LocaleQueryResult {
  locales: {
    edges: Array<{
      node: LocaleNode
    }>
  }
}
