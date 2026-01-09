import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GlassMagnifier from '../GlassMagnifier'
import Drift from 'drift-zoom'

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

const MockedDrift = jest.mocked(Drift)

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

describe('GlassMagnifier', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMatchMedia(false) // Default to desktop
  })

  const defaultProps = {
    src: '/test-image.jpg',
    zoomSrc: '/test-image-zoom.jpg',
    alt: 'Test painting',
  }

  it('renders the component with data-testid', () => {
    render(<GlassMagnifier {...defaultProps} />)
    expect(screen.getByTestId('glass-magnifier')).toBeInTheDocument()
  })

  it('renders the image with correct src and alt', () => {
    render(<GlassMagnifier {...defaultProps} />)
    const img = screen.getByRole('img', { name: /test painting/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test-image.jpg')
    expect(img).toHaveAttribute('data-zoom', '/test-image-zoom.jpg')
  })

  it('applies custom className to container', () => {
    render(<GlassMagnifier {...defaultProps} className="custom-class" />)
    const container = screen.getByTestId('glass-magnifier')
    expect(container).toHaveClass('custom-class')
  })

  it('shows touch hint on mobile', () => {
    mockMatchMedia(true) // Mobile
    render(<GlassMagnifier {...defaultProps} enableTouch={true} />)
    expect(screen.getByText(/tap and hold to zoom/i)).toBeInTheDocument()
  })

  it('does not show touch hint on desktop', () => {
    mockMatchMedia(false) // Desktop
    render(<GlassMagnifier {...defaultProps} />)
    expect(screen.queryByText(/tap and hold to zoom/i)).not.toBeInTheDocument()
  })

  it('does not show touch hint when enableTouch is false', () => {
    mockMatchMedia(true) // Mobile
    render(<GlassMagnifier {...defaultProps} enableTouch={false} />)
    expect(screen.queryByText(/tap and hold to zoom/i)).not.toBeInTheDocument()
  })

  it('initializes Drift when image loads', async () => {
    render(<GlassMagnifier {...defaultProps} />)

    const img = screen.getByRole('img')
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalled()
    })
  })

  it('cleans up Drift instance on unmount', async () => {
    const mockDestroy = jest.fn()
    MockedDrift.mockImplementation(
      () =>
        ({
          destroy: mockDestroy,
          disable: jest.fn(),
          enable: jest.fn(),
          setZoomImageURL: jest.fn(),
        }) as unknown as Drift
    )

    const { unmount } = render(<GlassMagnifier {...defaultProps} />)

    const img = screen.getByRole('img')
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalled()
    })

    unmount()

    expect(mockDestroy).toHaveBeenCalled()
  })

  it('passes correct zoom factor to Drift on desktop', async () => {
    mockMatchMedia(false) // Desktop

    render(<GlassMagnifier {...defaultProps} zoomFactor={3} />)

    const img = screen.getByRole('img')
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          zoomFactor: 3,
        })
      )
    })
  })

  it('uses inline pane on mobile', async () => {
    mockMatchMedia(true) // Mobile

    render(<GlassMagnifier {...defaultProps} />)

    const img = screen.getByRole('img')
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          inlinePane: true,
        })
      )
    })
  })

  it('uses pane container on desktop', async () => {
    mockMatchMedia(false) // Desktop

    render(<GlassMagnifier {...defaultProps} />)

    const img = screen.getByRole('img')
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          inlinePane: 500,
        })
      )
    })
  })
})
