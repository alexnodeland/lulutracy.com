import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PaintingTemplate, { Head } from '../painting'
import type { Painting } from '../../types'

// Mock ThemeContext to avoid ThemeProvider requirement
jest.mock('../../components/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: jest.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock drift-zoom
jest.mock('drift-zoom')

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

const mockPainting: Painting = {
  id: 'test-painting',
  title: 'Test Painting Title',
  description: 'This is a test painting description.',
  dimensions: {
    width: 45.5,
    height: 35.5,
    unit: 'cm',
  },
  substrate: 'canvas',
  substrateSize: {
    width: 45.5,
    height: 35.5,
    unit: 'cm',
  },
  medium: 'acrylic',
  year: '2023',
  image: 'test.jpeg',
  alt: 'Test painting alt text',
  order: 1,
}

const mockPageContext = {
  id: 'test-painting',
  painting: mockPainting,
  imageName: 'test',
  language: 'en',
}

const mockSiteYaml = {
  site: {
    name: 'lulutracy',
    author: 'Tracy Mah',
    url: 'https://alexnodeland.github.io/lulutracy.com',
  },
}

const mockDataWithImage = {
  file: {
    childImageSharp: {
      gatsbyImageData: {
        layout: 'constrained' as const,
        width: 800,
        height: 600,
        images: {
          fallback: {
            src: '/test.jpg',
            srcSet: '/test.jpg 800w',
            sizes: '(min-width: 800px) 800px, 100vw',
          },
        },
      },
    },
  },
  zoomFile: {
    childImageSharp: {
      gatsbyImageData: {
        layout: 'constrained' as const,
        width: 2400,
        height: 1800,
        images: {
          fallback: {
            src: '/test-zoom.jpg',
            srcSet: '/test-zoom.jpg 2400w',
            sizes: '(min-width: 2400px) 2400px, 100vw',
          },
        },
      },
    },
  },
  siteYaml: mockSiteYaml,
}

const mockDataWithoutImage = {
  file: null,
  zoomFile: null,
  siteYaml: mockSiteYaml,
}

const mockDataWithImageButNoZoom = {
  file: {
    childImageSharp: {
      gatsbyImageData: {
        layout: 'constrained' as const,
        width: 800,
        height: 600,
        images: {
          fallback: {
            src: '/test.jpg',
            srcSet: '/test.jpg 800w',
            sizes: '(min-width: 800px) 800px, 100vw',
          },
        },
      },
    },
  },
  zoomFile: null,
}

// Test data with empty images object
const mockDataWithEmptyImages = {
  file: {
    childImageSharp: {
      gatsbyImageData: {
        layout: 'constrained' as const,
        width: 800,
        height: 600,
        images: {},
      },
    },
  },
  zoomFile: null,
}

// Cast to any to bypass Gatsby PageProps typing in tests
const renderPaintingTemplate = (
  data = mockDataWithImage,
  pageContext = mockPageContext
) => {
  return render(
    <PaintingTemplate data={data} pageContext={pageContext} {...({} as any)} />
  )
}

describe('PaintingTemplate', () => {
  it('renders the page', () => {
    renderPaintingTemplate()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('displays the painting title', () => {
    renderPaintingTemplate()
    expect(
      screen.getByRole('heading', { name: /test painting title/i })
    ).toBeInTheDocument()
  })

  it('displays the painting category', () => {
    renderPaintingTemplate()
    expect(screen.getByText(/PAINTING/)).toBeInTheDocument()
  })

  it('displays the painting dimensions and medium', () => {
    renderPaintingTemplate()
    expect(screen.getByText(/45.5 × 35.5 cm/)).toBeInTheDocument()
    expect(screen.getByText(/Acrylic on canvas/)).toBeInTheDocument()
  })

  it('displays the painting year', () => {
    renderPaintingTemplate()
    expect(screen.getByText('2023')).toBeInTheDocument()
  })

  it('displays placeholder when no image data', () => {
    renderPaintingTemplate(mockDataWithoutImage as any)
    expect(screen.getByText(/image not available/i)).toBeInTheDocument()
  })

  it('renders the GlassMagnifier when image is available', () => {
    renderPaintingTemplate()
    expect(screen.getByTestId('glass-magnifier')).toBeInTheDocument()
  })

  it('renders the painting image with correct alt text', () => {
    renderPaintingTemplate()
    expect(
      screen.getByRole('img', { name: /test painting alt text/i })
    ).toBeInTheDocument()
  })

  it('renders with zoom image when available', () => {
    renderPaintingTemplate()
    const img = screen.getByRole('img', { name: /test painting alt text/i })
    expect(img).toHaveAttribute('data-zoom', '/test-zoom.jpg')
  })

  it('falls back to display image when zoom image is not available', () => {
    renderPaintingTemplate(mockDataWithImageButNoZoom as any)
    const img = screen.getByRole('img', { name: /test painting alt text/i })
    expect(img).toHaveAttribute('src', '/test.jpg')
    expect(img).toHaveAttribute('data-zoom', '/test.jpg')
  })

  describe('image fallback cases', () => {
    it('falls back to GatsbyImage when image data has no fallback src', () => {
      renderPaintingTemplate(mockDataWithEmptyImages as any)
      // When getSrc returns undefined, canUseMagnifier is false
      // but GatsbyImage is shown as fallback since imageData exists
      const img = screen.getByRole('img', { name: /test painting alt text/i })
      expect(img).toBeInTheDocument()
      // Should not have glass-magnifier (GatsbyImage is used instead)
      expect(screen.queryByTestId('glass-magnifier')).not.toBeInTheDocument()
    })

    it('falls back to GatsbyImage when magnifier image fails to load', () => {
      renderPaintingTemplate()
      // Initially renders with GlassMagnifier
      expect(screen.getByTestId('glass-magnifier')).toBeInTheDocument()

      // Simulate image error
      const img = screen.getByRole('img', { name: /test painting alt text/i })
      fireEvent.error(img)

      // After error, should fall back to GatsbyImage (no glass-magnifier)
      expect(screen.queryByTestId('glass-magnifier')).not.toBeInTheDocument()
      // GatsbyImage mock renders a simple img tag
      expect(
        screen.getByRole('img', { name: /test painting alt text/i })
      ).toBeInTheDocument()
    })
  })
})

describe('Head component', () => {
  it('renders title with painting name', () => {
    render(
      <Head
        data={mockDataWithImage as any}
        pageContext={mockPageContext}
        {...({} as any)}
      />
    )
    const title = document.querySelector('title')
    expect(title?.textContent).toBe('Test Painting Title | lulutracy')
  })

  it('renders meta description with painting description', () => {
    render(
      <Head
        data={mockDataWithImage as any}
        pageContext={mockPageContext}
        {...({} as any)}
      />
    )
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription?.getAttribute('content')).toBe(
      'This is a test painting description.'
    )
  })

  it('renders Open Graph meta tags', () => {
    const { container } = render(
      <Head
        data={mockDataWithImage as any}
        pageContext={mockPageContext}
        {...({} as any)}
      />
    )
    expect(
      container.querySelector('meta[property="og:title"]')
    ).toHaveAttribute('content', 'Test Painting Title | lulutracy')
    expect(container.querySelector('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'article'
    )
    expect(container.querySelector('meta[property="og:url"]')).toHaveAttribute(
      'content',
      expect.stringContaining('/painting/test-painting')
    )
  })

  it('renders JSON-LD structured data', () => {
    const { container } = render(
      <Head
        data={mockDataWithImage as any}
        pageContext={mockPageContext}
        {...({} as any)}
      />
    )
    const jsonLd = container.querySelector('script[type="application/ld+json"]')
    expect(jsonLd).toBeInTheDocument()
    const data = JSON.parse(jsonLd?.textContent || '{}')
    expect(data['@type']).toBe('VisualArtwork')
    expect(data.name).toBe('Test Painting Title')
    expect(data.artMedium).toBe('Acrylic on canvas')
  })

  it('uses fallback image when no image data', () => {
    const { container } = render(
      <Head
        data={mockDataWithoutImage as any}
        pageContext={mockPageContext}
        {...({} as any)}
      />
    )
    expect(
      container.querySelector('meta[property="og:image"]')
    ).toHaveAttribute('content', expect.stringContaining('/icon.png'))
  })

  it('renders with Chinese locale when language is zh', () => {
    const zhPageContext = {
      ...mockPageContext,
      language: 'zh',
    }
    const { container } = render(
      <Head
        data={mockDataWithImage as any}
        pageContext={zhPageContext}
        {...({} as any)}
      />
    )
    expect(
      container.querySelector('meta[property="og:locale"]')
    ).toHaveAttribute('content', 'zh_CN')
    expect(container.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      expect.stringContaining('/zh/painting/')
    )
  })

  it('renders hreflang alternate links', () => {
    const { container } = render(
      <Head
        data={mockDataWithImage as any}
        pageContext={mockPageContext}
        {...({} as any)}
      />
    )
    const hreflangLinks = container.querySelectorAll('link[rel="alternate"]')
    expect(hreflangLinks.length).toBeGreaterThanOrEqual(2)
  })

  it('handles missing language in pageContext', () => {
    const contextWithoutLanguage = {
      ...mockPageContext,
      language: undefined,
    }
    const { container } = render(
      <Head
        data={mockDataWithImage as any}
        pageContext={contextWithoutLanguage as any}
        {...({} as any)}
      />
    )
    expect(
      container.querySelector('meta[property="og:locale"]')
    ).toHaveAttribute('content', 'en_US')
  })
})

describe('Portrait image handling', () => {
  it('applies portrait class for tall images', () => {
    const portraitImageData = {
      ...mockDataWithImage,
      file: {
        childImageSharp: {
          gatsbyImageData: {
            layout: 'constrained' as const,
            width: 600,
            height: 800,
            images: {
              fallback: {
                src: '/test.jpg',
                srcSet: '/test.jpg 600w',
                sizes: '(min-width: 600px) 600px, 100vw',
              },
            },
          },
        },
      },
    }
    render(
      <PaintingTemplate
        data={portraitImageData as any}
        pageContext={mockPageContext}
        {...({} as any)}
      />
    )
    expect(screen.getByRole('article')).toBeInTheDocument()
  })
})

describe('Legacy string dimensions handling', () => {
  it('handles legacy string format dimensions', () => {
    const legacyPainting = {
      ...mockPainting,
      dimensions: '45.5 x 35.5 cm',
      substrateSize: '45.5 x 35.5 cm',
    }
    const legacyContext = {
      ...mockPageContext,
      painting: legacyPainting,
    }
    render(
      <PaintingTemplate
        data={mockDataWithImage as any}
        pageContext={legacyContext as any}
        {...({} as any)}
      />
    )
    // Legacy string format should be displayed as-is
    expect(screen.getByText(/45.5 x 35.5 cm/)).toBeInTheDocument()
  })

  it('handles legacy string dimensions in Head JSON-LD', () => {
    const legacyPainting = {
      ...mockPainting,
      dimensions: '45.5 x 35.5 cm',
    }
    const legacyContext = {
      ...mockPageContext,
      painting: legacyPainting,
    }
    const { container } = render(
      <Head
        data={mockDataWithImage as any}
        pageContext={legacyContext as any}
        {...({} as any)}
      />
    )
    const jsonLd = container.querySelector('script[type="application/ld+json"]')
    const data = JSON.parse(jsonLd?.textContent || '{}')
    expect(data.width).toBe('45.5 x 35.5 cm')
  })
})

describe('Site data fallbacks', () => {
  it('handles missing site URL in Head', () => {
    const dataWithoutUrl = {
      ...mockDataWithImage,
      siteYaml: {
        site: {
          name: 'lulutracy',
          author: 'Tracy Mah',
        },
      },
    }
    const { container } = render(
      <Head
        data={dataWithoutUrl as any}
        pageContext={mockPageContext}
        {...({} as any)}
      />
    )
    expect(container.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      '/painting/test-painting'
    )
  })

  it('handles missing site name in Head', () => {
    const dataWithoutName = {
      ...mockDataWithImage,
      siteYaml: {
        site: {
          url: 'https://example.com',
          author: 'Tracy Mah',
        },
      },
    }
    const { container } = render(
      <Head
        data={dataWithoutName as any}
        pageContext={mockPageContext}
        {...({} as any)}
      />
    )
    expect(container.querySelector('title')).toHaveTextContent(
      'Test Painting Title | lulutracy'
    )
  })

  it('handles missing author in Head', () => {
    const dataWithoutAuthor = {
      ...mockDataWithImage,
      siteYaml: {
        site: {
          name: 'lulutracy',
          url: 'https://example.com',
        },
      },
    }
    const { container } = render(
      <Head
        data={dataWithoutAuthor as any}
        pageContext={mockPageContext}
        {...({} as any)}
      />
    )
    const jsonLd = container.querySelector('script[type="application/ld+json"]')
    const data = JSON.parse(jsonLd?.textContent || '{}')
    expect(data.creator.name).toBe('')
  })

  it('handles unknown language in locale map', () => {
    const unknownLangContext = {
      ...mockPageContext,
      language: 'unknown',
    }
    const { container } = render(
      <Head
        data={mockDataWithImage as any}
        pageContext={unknownLangContext as any}
        {...({} as any)}
      />
    )
    // Should fall back to en_US
    expect(
      container.querySelector('meta[property="og:locale"]')
    ).toHaveAttribute('content', 'en_US')
  })
})
