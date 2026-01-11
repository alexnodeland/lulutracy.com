import React from 'react'
import { render, screen } from '@testing-library/react'
import AboutPage, { Head } from '../about'

// Mock ThemeContext to avoid ThemeProvider requirement
jest.mock('../../components/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: jest.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const mockSiteYaml = {
  site: {
    name: 'lulutracy',
    author: 'Tracy Mah',
    email: 'tracy@lulutracy.com',
    url: 'https://our-nature.github.io/lulutracy.com',
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
              'Art portfolio of lulutracy - exploring nature through watercolors and acrylics',
          },
        }),
        language: 'en',
      },
    },
  ],
}

const mockData = {
  locales: mockLocales,
  markdownRemark: {
    frontmatter: {
      title: 'About',
      artistName: ';-)',
      photo: {
        childImageSharp: {
          gatsbyImageData: {
            layout: 'constrained' as const,
            width: 500,
            height: 500,
            images: {
              fallback: {
                src: '/static/about.jpg',
              },
            },
          },
        },
      },
    },
    html: '<p>This is the artist biography.</p><p>More content here.</p>',
    excerpt: 'This is the artist biography. More content here.',
  },
  siteYaml: mockSiteYaml,
}

// Cast to any to bypass Gatsby PageProps typing in tests
const renderAboutPage = () => {
  return render(<AboutPage data={mockData} {...({} as any)} />)
}

describe('AboutPage', () => {
  it('renders the page', () => {
    renderAboutPage()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('displays the artist name', () => {
    renderAboutPage()
    expect(screen.getByRole('heading', { name: /;-\)/ })).toBeInTheDocument()
  })

  it('displays the biography content', () => {
    renderAboutPage()
    expect(
      screen.getByText(/This is the artist biography/i)
    ).toBeInTheDocument()
  })

  it('has a contact button', () => {
    renderAboutPage()
    const contactLink = screen.getByRole('link', { name: /contact/i })
    expect(contactLink).toBeInTheDocument()
    expect(contactLink).toHaveAttribute('href', 'mailto:tracy@lulutracy.com')
  })

  it('renders the artist photo', () => {
    renderAboutPage()
    const images = screen.getAllByRole('img', { name: /tracy mah/i })
    // Should have at least one image (logo in header and about photo)
    expect(images.length).toBeGreaterThanOrEqual(1)
  })

  it('renders placeholder when image is not available', () => {
    const dataWithoutImage = {
      ...mockData,
      markdownRemark: {
        ...mockData.markdownRemark,
        frontmatter: {
          ...mockData.markdownRemark.frontmatter,
          photo: null,
        },
      },
    }
    render(<AboutPage data={dataWithoutImage} {...({} as any)} />)
    expect(screen.getByText(/photo not available/i)).toBeInTheDocument()
  })

  it('renders fallback when markdownRemark is null', () => {
    const dataWithoutMarkdown = {
      ...mockData,
      markdownRemark: null,
    }
    render(<AboutPage data={dataWithoutMarkdown} {...({} as any)} />)
    expect(screen.getByText(/content not available/i)).toBeInTheDocument()
  })

  it('uses locale override for Chinese language', () => {
    const zhLocales = {
      edges: [
        {
          node: {
            ns: 'common',
            data: JSON.stringify({
              site: { tagline: '艺术与设计', description: '中文描述' },
            }),
            language: 'zh',
          },
        },
      ],
    }
    const dataWithZhOverride = {
      ...mockData,
      locales: zhLocales,
    }
    render(<AboutPage data={dataWithZhOverride} {...({} as any)} />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})

describe('Head', () => {
  it('renders meta tags', () => {
    const { container } = render(<Head data={mockData} {...({} as any)} />)
    expect(container.querySelector('title')).toHaveTextContent(
      'about | lulutracy'
    )
    expect(
      container.querySelector('meta[property="og:title"]')
    ).toHaveAttribute('content', 'about | lulutracy')
    expect(container.querySelector('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'website'
    )
    expect(container.querySelector('meta[property="og:url"]')).toHaveAttribute(
      'content',
      expect.stringContaining('/about')
    )
  })

  it('renders fallback title when markdownRemark is null', () => {
    const dataWithoutMarkdown = {
      ...mockData,
      markdownRemark: null,
    }
    const { container } = render(
      <Head data={dataWithoutMarkdown} {...({} as any)} />
    )
    expect(container.querySelector('title')).toHaveTextContent(
      'About | lulutracy'
    )
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
      expect.stringContaining('/zh/about')
    )
  })

  it('renders hreflang alternate links', () => {
    const { container } = render(<Head data={mockData} {...({} as any)} />)
    const hreflangLinks = container.querySelectorAll('link[rel="alternate"]')
    expect(hreflangLinks.length).toBeGreaterThanOrEqual(2)
  })

  it('uses locale override for Chinese description in Head', () => {
    const zhLocales = {
      edges: [
        {
          node: {
            ns: 'common',
            data: JSON.stringify({
              site: { tagline: '艺术与设计', description: '中文描述' },
            }),
            language: 'zh',
          },
        },
      ],
    }
    const dataWithZhOverride = {
      ...mockData,
      locales: zhLocales,
    }
    const { container } = render(
      <Head
        data={dataWithZhOverride}
        pageContext={{ language: 'zh' }}
        {...({} as any)}
      />
    )
    expect(container.querySelector('title')).toHaveTextContent(
      'about | lulutracy'
    )
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
