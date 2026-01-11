import React from 'react'
import { render, screen } from '@testing-library/react'
import IndexPage, { Head } from '../index'
import type { Painting } from '../../types'

const mockPaintings: Painting[] = [
  {
    id: 'painting-1',
    title: 'Test Painting 1',
    description: 'Description 1',
    dimensions: {
      width: 24,
      height: 36,
      unit: 'cm',
    },
    substrate: 'canvas',
    substrateSize: {
      width: 24,
      height: 36,
      unit: 'cm',
    },
    medium: 'oil',
    year: '2023',
    image: 'test1.jpg',
    alt: 'Alt text 1',
    order: 1,
  },
  {
    id: 'painting-2',
    title: 'Test Painting 2',
    description: 'Description 2',
    dimensions: {
      width: 30,
      height: 40,
      unit: 'cm',
    },
    substrate: 'paper',
    substrateSize: {
      width: 30,
      height: 40,
      unit: 'cm',
    },
    medium: 'acrylic',
    year: '2024',
    image: 'test2.jpg',
    alt: 'Alt text 2',
    order: 2,
  },
]

const mockSiteYaml = {
  site: {
    name: 'lulutracy',
    url: 'https://alexnodeland.github.io/lulutracy.com',
  },
}

// Mock locale data (simulates allLocale query)
const mockLocales = {
  edges: [
    {
      node: {
        ns: 'common',
        data: JSON.stringify({
          site: {
            tagline: 'art & design',
            description:
              'Art portfolio of Lulu Tracy - exploring nature through watercolors and acrylics',
          },
          nav: { about: 'about', home: 'Lulu Tracy - Home' },
          copyright: 'Copyright {{year}} lulutracy. All rights reserved.',
        }),
        language: 'en',
      },
    },
  ],
}

interface LocaleNode {
  locale: string
  paintings: Array<{ title: string; description: string; alt: string }>
}

const mockData = {
  locales: mockLocales,
  paintingsYaml: {
    paintings: mockPaintings,
  },
  allPaintingLocalesYaml: {
    nodes: [] as LocaleNode[],
  },
  allFile: {
    nodes: [
      {
        name: 'test1',
        childImageSharp: {
          gatsbyImageData: {
            layout: 'constrained' as const,
            width: 800,
            height: 600,
            images: {
              fallback: {
                src: '/test1.jpg',
                srcSet: '/test1.jpg 800w',
                sizes: '(min-width: 800px) 800px, 100vw',
              },
            },
          },
        },
      },
      {
        name: 'test2',
        childImageSharp: {
          gatsbyImageData: {
            layout: 'constrained' as const,
            width: 800,
            height: 600,
            images: {
              fallback: {
                src: '/test2.jpg',
                srcSet: '/test2.jpg 800w',
                sizes: '(min-width: 800px) 800px, 100vw',
              },
            },
          },
        },
      },
    ],
  },
  siteYaml: mockSiteYaml,
}

const mockPageContext = {
  language: 'en',
}

// Cast to any to bypass Gatsby PageProps typing in tests
const renderIndexPage = (data = mockData, pageContext = mockPageContext) => {
  return render(
    <IndexPage data={data} pageContext={pageContext} {...({} as any)} />
  )
}

describe('IndexPage', () => {
  it('renders the page', () => {
    renderIndexPage()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders gallery images', () => {
    renderIndexPage()
    const links = screen.getAllByRole('link')
    // Filter out header link
    const galleryLinks = links.filter((link) =>
      link.getAttribute('aria-label')?.includes('View')
    )
    expect(galleryLinks.length).toBe(2)
  })

  it('displays paintings sorted by order', () => {
    renderIndexPage()
    const links = screen.getAllByRole('link')
    const galleryLinks = links.filter((link) =>
      link.getAttribute('aria-label')?.includes('View')
    )
    expect(galleryLinks[0]).toHaveAttribute('href', '/painting/test-painting-1')
    expect(galleryLinks[1]).toHaveAttribute('href', '/painting/test-painting-2')
  })

  it('handles empty paintings gracefully', () => {
    const emptyData = {
      locales: mockLocales,
      paintingsYaml: { paintings: [] },
      allPaintingLocalesYaml: { nodes: [] },
      allFile: { nodes: [] },
      siteYaml: mockSiteYaml,
    }
    renderIndexPage(emptyData as any)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('handles undefined paintings gracefully', () => {
    const undefinedData = {
      locales: mockLocales,
      paintingsYaml: null,
      allPaintingLocalesYaml: { nodes: [] },
      allFile: { nodes: [] },
      siteYaml: mockSiteYaml,
    }
    renderIndexPage(undefinedData as any)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('handles missing pageContext.language gracefully', () => {
    renderIndexPage(mockData, {} as any)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('handles Chinese language context with locale overrides', () => {
    const zhData = {
      ...mockData,
      allPaintingLocalesYaml: {
        nodes: [
          {
            locale: 'zh',
            paintings: [
              {
                title: 'Test Painting 1',
                description: '描述1',
                alt: '替代文本1',
              },
              {
                title: 'Test Painting 2',
                description: '描述2',
                alt: '替代文本2',
              },
            ],
          },
        ],
      },
    }
    renderIndexPage(zhData, { language: 'zh' })
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('uses base painting data when locale override is missing', () => {
    // No locale overrides provided - should fall back to base (English) data
    const dataNoOverrides = {
      ...mockData,
      allPaintingLocalesYaml: { nodes: [] },
    }
    renderIndexPage(dataNoOverrides, { language: 'zh' })
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})

describe('Head', () => {
  it('renders meta tags with painting image', () => {
    const { container } = render(<Head data={mockData} {...({} as any)} />)
    expect(container.querySelector('title')).toHaveTextContent(
      'lulutracy | art & design'
    )
    expect(
      container.querySelector('meta[property="og:title"]')
    ).toHaveAttribute('content', 'lulutracy | art & design')
    expect(container.querySelector('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'website'
    )
    expect(
      container.querySelector('script[type="application/ld+json"]')
    ).toBeInTheDocument()
  })

  it('renders with fallback image when no paintings exist', () => {
    const emptyData = {
      locales: mockLocales,
      paintingsYaml: { paintings: [] },
      allPaintingLocalesYaml: { nodes: [] },
      allFile: { nodes: [] },
      siteYaml: mockSiteYaml,
    }
    const { container } = render(
      <Head data={emptyData as any} {...({} as any)} />
    )
    expect(
      container.querySelector('meta[property="og:image"]')
    ).toHaveAttribute('content', expect.stringContaining('/icon.png'))
  })

  it('renders with fallback image when paintings is undefined', () => {
    const undefinedData = {
      locales: mockLocales,
      paintingsYaml: null,
      allPaintingLocalesYaml: { nodes: [] },
      allFile: { nodes: [] },
      siteYaml: mockSiteYaml,
    }
    const { container } = render(
      <Head data={undefinedData as any} {...({} as any)} />
    )
    expect(
      container.querySelector('meta[property="og:image"]')
    ).toHaveAttribute('content', expect.stringContaining('/icon.png'))
  })

  it('renders with Chinese locale when language is zh', () => {
    const { container } = render(
      <Head data={mockData} pageContext={{ language: 'zh' }} {...({} as any)} />
    )
    expect(
      container.querySelector('meta[property="og:locale"]')
    ).toHaveAttribute('content', 'zh_CN')
    expect(container.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      expect.stringContaining('/zh/')
    )
  })

  it('renders hreflang alternate links', () => {
    const { container } = render(<Head data={mockData} {...({} as any)} />)
    const hreflangLinks = container.querySelectorAll('link[rel="alternate"]')
    expect(hreflangLinks.length).toBeGreaterThanOrEqual(2)
  })

  it('handles missing site properties gracefully', () => {
    const dataMissingSiteProps = {
      ...mockData,
      siteYaml: {
        site: {},
      },
    }
    const { container } = render(
      <Head data={dataMissingSiteProps as any} {...({} as any)} />
    )
    expect(
      container.querySelector('meta[property="og:site_name"]')
    ).toHaveAttribute('content', '')
  })

  it('handles missing image node gracefully', () => {
    const dataNoImageMatch = {
      ...mockData,
      allFile: {
        nodes: [
          {
            name: 'nonexistent',
            childImageSharp: null,
          },
        ],
      },
    }
    const { container } = render(
      <Head data={dataNoImageMatch as any} {...({} as any)} />
    )
    expect(
      container.querySelector('meta[property="og:image"]')
    ).toHaveAttribute('content', expect.stringContaining('/icon.png'))
  })

  it('handles invalid JSON in locale data gracefully', () => {
    const dataInvalidJson = {
      ...mockData,
      locales: {
        edges: [
          {
            node: {
              ns: 'common',
              data: 'invalid json {{{',
              language: 'en',
            },
          },
        ],
      },
    }
    const { container } = render(
      <Head data={dataInvalidJson as any} {...({} as any)} />
    )
    // Should still render, falling back to defaults
    expect(container.querySelector('title')).toBeInTheDocument()
  })

  it('handles missing locale namespace gracefully', () => {
    const dataMissingNs = {
      ...mockData,
      locales: {
        edges: [
          {
            node: {
              ns: 'other',
              data: JSON.stringify({ key: 'value' }),
              language: 'en',
            },
          },
        ],
      },
    }
    const { container } = render(
      <Head data={dataMissingNs as any} {...({} as any)} />
    )
    // Should still render, falling back to defaults
    expect(container.querySelector('title')).toBeInTheDocument()
  })
})
