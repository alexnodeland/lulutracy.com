import React from 'react'
import { render, screen } from '@testing-library/react'
import IndexPage, { Head } from '../index'
import type { Painting } from '../../types'

const mockPaintings: Painting[] = [
  {
    id: 'painting-1',
    title: 'Test Painting 1',
    description: 'Description 1',
    dimensions: '24 x 36',
    canvasSize: '24 x 36',
    medium: 'Oil',
    year: '2023',
    image: 'test1.jpg',
    alt: 'Alt text 1',
    order: 1,
  },
  {
    id: 'painting-2',
    title: 'Test Painting 2',
    description: 'Description 2',
    dimensions: '30 x 40',
    canvasSize: '30 x 40',
    medium: 'Acrylic',
    year: '2024',
    image: 'test2.jpg',
    alt: 'Alt text 2',
    order: 2,
  },
]

const mockData = {
  allPaintingsYaml: {
    nodes: [
      {
        paintings: mockPaintings,
      },
    ],
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
}

// Cast to any to bypass Gatsby PageProps typing in tests
const renderIndexPage = (data = mockData) => {
  return render(<IndexPage data={data} {...({} as any)} />)
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
    expect(galleryLinks[0]).toHaveAttribute('href', '/painting/painting-1')
    expect(galleryLinks[1]).toHaveAttribute('href', '/painting/painting-2')
  })

  it('handles empty paintings gracefully', () => {
    const emptyData = {
      allPaintingsYaml: {
        nodes: [{ paintings: [] }],
      },
      allFile: {
        nodes: [],
      },
    }
    renderIndexPage(emptyData as any)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})

describe('Head', () => {
  it('renders meta tags with painting image', () => {
    const { container } = render(<Head data={mockData} {...({} as any)} />)
    expect(container.querySelector('title')).toHaveTextContent(
      'Lulu Tracy | Art Portfolio'
    )
    expect(
      container.querySelector('meta[property="og:title"]')
    ).toHaveAttribute('content', 'Lulu Tracy | Art Portfolio')
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
      allPaintingsYaml: {
        nodes: [{ paintings: [] }],
      },
      allFile: {
        nodes: [],
      },
    }
    const { container } = render(
      <Head data={emptyData as any} {...({} as any)} />
    )
    expect(
      container.querySelector('meta[property="og:image"]')
    ).toHaveAttribute('content', expect.stringContaining('/icon.png'))
  })
})
