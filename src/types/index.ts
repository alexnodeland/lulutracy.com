// Painting types
export interface Painting {
  id: string
  title: string
  description: string
  dimensions: string
  canvasSize: string
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
  }
  html: string
}
