import React from 'react'
import { render, screen } from '@testing-library/react'
import GalleryImage from '../GalleryImage'
import type { Painting } from '../../types'

const mockPainting: Painting = {
  id: 'test-painting',
  title: 'Test Painting',
  description: 'A test painting description',
  dimensions: '24 x 36 inches',
  canvasSize: '24 x 36 inches',
  medium: 'Oil on canvas',
  year: '2023',
  image: 'test.jpg',
  alt: 'Test painting alt text',
  order: 1,
}

const mockImageData = {
  layout: 'constrained' as const,
  width: 800,
  height: 600,
  images: {
    fallback: {
      src: '/test-image.jpg',
      srcSet: '/test-image.jpg 800w',
      sizes: '(min-width: 800px) 800px, 100vw',
    },
  },
  placeholder: {
    fallback: 'data:image/jpeg;base64,test',
  },
}

describe('GalleryImage', () => {
  it('renders the image when image data is provided', () => {
    render(<GalleryImage painting={mockPainting} image={mockImageData} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders placeholder when no image data is provided', () => {
    render(<GalleryImage painting={mockPainting} image={null} />)
    expect(screen.getByText('Test Painting')).toBeInTheDocument()
  })

  it('links to the correct painting detail page', () => {
    render(<GalleryImage painting={mockPainting} image={mockImageData} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/painting/test-painting')
  })

  it('has accessible label', () => {
    render(<GalleryImage painting={mockPainting} image={mockImageData} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', 'View Test Painting')
  })
})
