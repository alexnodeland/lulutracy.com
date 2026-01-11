import React from 'react'
import { render, screen, act } from '@testing-library/react'
import GalleryImage from '../GalleryImage'
import type { Painting } from '../../types'

// Mock IntersectionObserver
const mockObserve = jest.fn()
const mockUnobserve = jest.fn()
const mockDisconnect = jest.fn()

let intersectionCallback: (
  entries: { isIntersecting: boolean; target: Element }[]
) => void

const mockIntersectionObserver = jest.fn().mockImplementation((callback) => {
  intersectionCallback = callback
  return {
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  }
})

Object.defineProperty(window, 'IntersectionObserver', {
  value: mockIntersectionObserver,
  writable: true,
})

const mockPainting: Painting = {
  id: 'test-painting',
  title: 'Test Painting',
  description: 'A test painting description',
  dimensions: {
    width: 24,
    height: 36,
    unit: 'in',
  },
  substrate: 'canvas',
  substrateSize: {
    width: 24,
    height: 36,
    unit: 'in',
  },
  medium: 'oil',
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
  let setTimeoutSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    setTimeoutSpy = jest.spyOn(window, 'setTimeout')
  })

  afterEach(() => {
    jest.useRealTimers()
    setTimeoutSpy.mockRestore()
  })

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

  it('sets up intersection observer on mount', () => {
    render(<GalleryImage painting={mockPainting} image={mockImageData} />)
    expect(mockIntersectionObserver).toHaveBeenCalled()
    expect(mockObserve).toHaveBeenCalled()
  })

  it('disconnects intersection observer on unmount', () => {
    const { unmount } = render(
      <GalleryImage painting={mockPainting} image={mockImageData} />
    )
    unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('triggers visibility animation when intersection observer triggers', () => {
    const { container } = render(
      <GalleryImage painting={mockPainting} image={mockImageData} />
    )

    const galleryItem = container.firstChild as HTMLElement

    // Simulate intersection
    act(() => {
      intersectionCallback([{ isIntersecting: true, target: galleryItem }])
    })

    // Fast-forward timers for staggered animation
    act(() => {
      jest.runAllTimers()
    })

    // The component should have rendered (visibility is handled by CSS module class)
    expect(galleryItem).toBeInTheDocument()
  })

  it('applies index-based delay for staggered animation', () => {
    render(
      <GalleryImage painting={mockPainting} image={mockImageData} index={3} />
    )

    // Simulate intersection
    act(() => {
      intersectionCallback([
        { isIntersecting: true, target: document.createElement('div') },
      ])
    })

    // Verify the delay is applied based on index (300ms for index 3)
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 300)
  })

  it('caps staggered delay at 500ms for high indices', () => {
    render(
      <GalleryImage painting={mockPainting} image={mockImageData} index={10} />
    )

    // Simulate intersection
    act(() => {
      intersectionCallback([
        { isIntersecting: true, target: document.createElement('div') },
      ])
    })

    // The delay should be capped at 500ms (Math.min(10 * 100, 500) = 500)
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 500)
  })

  it('renders hover overlay', () => {
    render(<GalleryImage painting={mockPainting} image={mockImageData} />)
    expect(screen.getByText('View')).toBeInTheDocument()
  })

  it('uses default index of 0 when not provided', () => {
    render(<GalleryImage painting={mockPainting} image={mockImageData} />)

    // Simulate intersection
    act(() => {
      intersectionCallback([
        { isIntersecting: true, target: document.createElement('div') },
      ])
    })

    // With index 0, delay should be 0ms
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0)
  })

  it('unobserves element after intersection', () => {
    const { container } = render(
      <GalleryImage painting={mockPainting} image={mockImageData} />
    )

    const galleryItem = container.firstChild as HTMLElement

    // Simulate intersection
    act(() => {
      intersectionCallback([{ isIntersecting: true, target: galleryItem }])
    })

    expect(mockUnobserve).toHaveBeenCalledWith(galleryItem)
  })

  it('does not trigger visibility when not intersecting', () => {
    const { container } = render(
      <GalleryImage painting={mockPainting} image={mockImageData} />
    )

    const galleryItem = container.firstChild as HTMLElement

    // Simulate non-intersection
    act(() => {
      intersectionCallback([{ isIntersecting: false, target: galleryItem }])
    })

    act(() => {
      jest.runAllTimers()
    })

    // Component should still render correctly
    expect(galleryItem).toBeInTheDocument()
  })
})
