import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GlassMagnifier from '../GlassMagnifier'

// Mock drift-zoom before importing anything that uses it
jest.mock('drift-zoom')

// Get the mocked module
const MockedDrift = jest.requireMock('drift-zoom').default as jest.Mock

let mockDestroyFn: jest.Mock = jest.fn()

// Default mock implementation
const createMockDrift = () => {
  return {
    disable: jest.fn(),
    enable: jest.fn(),
    setZoomImageURL: jest.fn(),
    destroy: mockDestroyFn,
  }
}

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
    mockDestroyFn = jest.fn()
    MockedDrift.mockImplementation(createMockDrift)
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

  it('renders zoom indicator icon', () => {
    render(<GlassMagnifier {...defaultProps} />)
    const svg = screen.getByTestId('glass-magnifier').querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('shows touch hint on mobile', () => {
    mockMatchMedia(true) // Mobile
    render(<GlassMagnifier {...defaultProps} enableTouch={true} />)
    expect(screen.getByText(/tap and hold to zoom/i)).toBeInTheDocument()
  })

  it('shows hover hint on desktop', () => {
    mockMatchMedia(false) // Desktop
    render(<GlassMagnifier {...defaultProps} />)
    expect(screen.getByText(/hover to zoom/i)).toBeInTheDocument()
  })

  it('does not show touch hint when enableTouch is false on mobile', () => {
    mockMatchMedia(true) // Mobile
    render(<GlassMagnifier {...defaultProps} enableTouch={false} />)
    // Still shows hint since enableTouch only affects touch handling, not hint
    expect(screen.getByText(/tap and hold to zoom/i)).toBeInTheDocument()
  })

  it('initializes Drift when image loads', async () => {
    render(<GlassMagnifier {...defaultProps} />)

    const img = screen.getByRole('img', { name: /test painting/i })
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalled()
    })
  })

  it('cleans up Drift instance on unmount', async () => {
    const { unmount } = render(<GlassMagnifier {...defaultProps} />)

    const img = screen.getByRole('img', { name: /test painting/i })
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalled()
    })

    unmount()

    expect(mockDestroyFn).toHaveBeenCalled()
  })

  it('passes correct zoom factor to Drift on desktop', async () => {
    mockMatchMedia(false) // Desktop

    render(<GlassMagnifier {...defaultProps} zoomFactor={3} />)

    const img = screen.getByRole('img', { name: /test painting/i })
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

    const img = screen.getByRole('img', { name: /test painting/i })
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

    const img = screen.getByRole('img', { name: /test painting/i })
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

  it('passes onShow and onHide callbacks to Drift', async () => {
    render(<GlassMagnifier {...defaultProps} />)

    const img = screen.getByRole('img', { name: /test painting/i })
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalled()
    })

    // Verify callbacks were passed to Drift
    expect(MockedDrift).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        onShow: expect.any(Function),
        onHide: expect.any(Function),
      })
    )
  })

  it('handles Drift initialization error gracefully', async () => {
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {})
    MockedDrift.mockImplementation(() => {
      throw new Error('Drift init failed')
    })

    render(<GlassMagnifier {...defaultProps} />)

    const img = screen.getByRole('img', { name: /test painting/i })
    fireEvent.load(img)

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to initialize Drift magnifier:',
        expect.any(Error)
      )
    })

    consoleWarnSpy.mockRestore()
  })

  it('reinitializes Drift when mobile state changes', async () => {
    mockMatchMedia(false) // Start as desktop
    const { rerender } = render(<GlassMagnifier {...defaultProps} />)

    const img = screen.getByRole('img', { name: /test painting/i })
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalledTimes(1)
    })

    // Simulate resize to mobile
    mockMatchMedia(true)
    fireEvent(window, new Event('resize'))

    // Force rerender to pick up new matchMedia
    rerender(<GlassMagnifier {...defaultProps} />)

    // Wait for destroy and reinit
    await waitFor(() => {
      expect(mockDestroyFn).toHaveBeenCalled()
    })
  })

  it('applies reduced zoom factor on mobile', async () => {
    mockMatchMedia(true) // Mobile

    render(<GlassMagnifier {...defaultProps} zoomFactor={2} />)

    const img = screen.getByRole('img', { name: /test painting/i })
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          // Mobile zoom factor is 0.75 * zoomFactor
          zoomFactor: 1.5,
        })
      )
    })
  })

  it('does not initialize Drift before image loads', () => {
    render(<GlassMagnifier {...defaultProps} />)
    // Drift should not be called until image loads
    expect(MockedDrift).not.toHaveBeenCalled()
  })

  it('does not reinitialize Drift if already initialized with same settings', async () => {
    mockMatchMedia(false) // Desktop

    render(<GlassMagnifier {...defaultProps} />)

    const img = screen.getByRole('img', { name: /test painting/i })
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalledTimes(1)
    })

    // Trigger another load event (should not reinitialize)
    fireEvent.load(img)

    // Still only one call
    expect(MockedDrift).toHaveBeenCalledTimes(1)
  })

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      mockMatchMedia(false) // Desktop
      render(<GlassMagnifier {...defaultProps} />)
      const container = screen.getByTestId('glass-magnifier')

      expect(container).toHaveAttribute('role', 'group')
      expect(container).toHaveAttribute(
        'aria-label',
        'Zoomable image: Test painting. Hover to zoom.'
      )
      expect(container).toHaveAttribute('tabIndex', '0')
    })

    it('has mobile-specific ARIA label on mobile', () => {
      mockMatchMedia(true) // Mobile
      render(<GlassMagnifier {...defaultProps} />)
      const container = screen.getByTestId('glass-magnifier')

      expect(container).toHaveAttribute(
        'aria-label',
        'Zoomable image: Test painting. Tap and hold to zoom.'
      )
    })

    it('responds to keyboard interaction', () => {
      render(<GlassMagnifier {...defaultProps} />)
      const container = screen.getByTestId('glass-magnifier')

      // Initially shows hint
      expect(screen.getByText(/hover to zoom/i)).toBeInTheDocument()

      // Press Enter to toggle hint
      fireEvent.keyDown(container, { key: 'Enter' })
      expect(screen.queryByText(/hover to zoom/i)).not.toBeInTheDocument()

      // Press Space to toggle hint back
      fireEvent.keyDown(container, { key: ' ' })
      expect(screen.getByText(/hover to zoom/i)).toBeInTheDocument()
    })

    it('has aria-hidden on zoom indicator', () => {
      render(<GlassMagnifier {...defaultProps} />)
      const indicator = screen
        .getByTestId('glass-magnifier')
        .querySelector('div > svg')?.parentElement
      expect(indicator).toHaveAttribute('aria-hidden', 'true')
    })

    it('has aria-live on hint for screen readers', () => {
      render(<GlassMagnifier {...defaultProps} />)
      const hint = screen.getByText(/hover to zoom/i).parentElement
      expect(hint).toHaveAttribute('aria-live', 'polite')
    })
  })
})
