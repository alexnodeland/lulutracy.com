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
})
