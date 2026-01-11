import React from 'react'
import { render, screen } from '@testing-library/react'
import AboutPage, { Head } from '../about'

const mockAllSiteYaml = {
  nodes: [
    {
      site: {
        name: 'lulutracy',
        description:
          'Art portfolio of lulutracy - exploring nature through watercolors and acrylics',
        author: 'Tracy Mah',
        email: 'tracy@lulutracy.com',
        url: 'https://alexnodeland.github.io/lulutracy.com',
      },
      parent: {
        name: 'en',
      },
    },
  ],
}

const mockData = {
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
  allSiteYaml: mockAllSiteYaml,
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

  it('uses fallback site when English site node not found', () => {
    const dataWithNonEnglishSite = {
      ...mockData,
      allSiteYaml: {
        nodes: [
          {
            site: mockAllSiteYaml.nodes[0].site,
            parent: { name: 'zh' },
          },
        ],
      },
    }
    render(<AboutPage data={dataWithNonEnglishSite} {...({} as any)} />)
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

  it('uses fallback site when English site node not found', () => {
    const dataWithNonEnglishSite = {
      ...mockData,
      allSiteYaml: {
        nodes: [
          {
            site: mockAllSiteYaml.nodes[0].site,
            parent: { name: 'zh' },
          },
        ],
      },
    }
    const { container } = render(
      <Head data={dataWithNonEnglishSite} {...({} as any)} />
    )
    expect(container.querySelector('title')).toHaveTextContent(
      'about | lulutracy'
    )
  })
})
