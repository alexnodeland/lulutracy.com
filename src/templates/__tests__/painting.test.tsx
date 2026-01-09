import React from 'react'
import { render, screen } from '@testing-library/react'
import PaintingTemplate from '../painting'
import type { Painting } from '../../types'

// Mock drift-zoom
jest.mock('drift-zoom', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      disable: jest.fn(),
      enable: jest.fn(),
      setZoomImageURL: jest.fn(),
      destroy: jest.fn(),
    })),
  }
})

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
}

const mockDataWithoutImage = {
  file: null,
  zoomFile: null,
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
    // Should use the same image for both src and data-zoom
    expect(img).toHaveAttribute('src', '/test.jpg')
    expect(img).toHaveAttribute('data-zoom', '/test.jpg')
  })
})
