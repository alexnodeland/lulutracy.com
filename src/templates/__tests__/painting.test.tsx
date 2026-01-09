import React from 'react'
import { render, screen } from '@testing-library/react'
import PaintingTemplate from '../painting'
import type { Painting } from '../../types'

const mockPainting: Painting = {
  id: 'test-painting',
  title: 'Test Painting Title',
  description: 'This is a test painting description.',
  dimensions: '45.5 x 35.5cm',
  canvasSize: '45.5 x 35.5 cm',
  medium: 'Acrylic on canvas',
  year: '2023',
  image: 'test.jpeg',
  alt: 'Test painting alt text',
  order: 1,
}

const mockPageContext = {
  id: 'test-painting',
  painting: mockPainting,
  imageName: 'test',
}

const mockDataWithImage = {
  file: {
    childImageSharp: {
      gatsbyImageData: {
        layout: 'constrained' as const,
        width: 1200,
        height: 900,
        images: {
          fallback: {
            src: '/test.jpg',
            srcSet: '/test.jpg 1200w',
            sizes: '(min-width: 1200px) 1200px, 100vw',
          },
        },
      },
    },
  },
}

const mockDataWithoutImage = {
  file: null,
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
    expect(screen.getByText(/45.5 x 35.5cm/)).toBeInTheDocument()
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

  it('renders the painting image when available', () => {
    renderPaintingTemplate()
    const images = screen.getAllByRole('img')
    // Should have multiple images (logo + painting)
    expect(images.length).toBeGreaterThanOrEqual(2)
    // Check that painting image with specific alt text exists
    expect(
      screen.getByRole('img', { name: /test painting alt text/i })
    ).toBeInTheDocument()
  })
})
