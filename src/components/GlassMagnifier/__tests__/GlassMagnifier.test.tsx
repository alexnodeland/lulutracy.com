import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
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
    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test-image.jpg')
    expect(img).toHaveAttribute('data-zoom', '/test-image-zoom.jpg')
    expect(img).toHaveAttribute('alt', 'Test painting')
  })

  it('applies custom className to container', () => {
    render(<GlassMagnifier {...defaultProps} className="custom-class" />)
    const container = screen.getByTestId('glass-magnifier')
    expect(container).toHaveClass('custom-class')
  })

  it('renders zoom indicator icon on desktop', () => {
    mockMatchMedia(false) // Desktop
    render(<GlassMagnifier {...defaultProps} />)
    const svg = screen.getByTestId('glass-magnifier').querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('does not show hint on mobile (magnifier disabled)', () => {
    mockMatchMedia(true) // Mobile
    render(<GlassMagnifier {...defaultProps} enableTouch={true} />)
    // No hints on mobile since magnifier is disabled
    expect(screen.queryByText(/tapToZoom/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/hoverToZoom/i)).not.toBeInTheDocument()
  })

  it('shows hover hint on desktop', () => {
    mockMatchMedia(false) // Desktop
    render(<GlassMagnifier {...defaultProps} />)
    // Translation mock returns the key
    expect(screen.getByText(/hoverToZoom/i)).toBeInTheDocument()
  })

  it('does not show zoom indicator on mobile', () => {
    mockMatchMedia(true) // Mobile
    render(<GlassMagnifier {...defaultProps} />)
    // No zoom indicator on mobile since magnifier is disabled
    const svg = screen.getByTestId('glass-magnifier').querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('initializes Drift when image loads', async () => {
    render(<GlassMagnifier {...defaultProps} />)

    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalled()
    })
  })

  it('cleans up Drift instance on unmount', async () => {
    const { unmount } = render(<GlassMagnifier {...defaultProps} />)

    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!
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

    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!
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

  it('does not initialize Drift on mobile', async () => {
    mockMatchMedia(true) // Mobile

    render(<GlassMagnifier {...defaultProps} />)

    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!
    fireEvent.load(img)

    // Wait a tick to ensure any async initialization would have occurred
    await waitFor(() => {
      // Drift should NOT be called on mobile
      expect(MockedDrift).not.toHaveBeenCalled()
    })
  })

  it('uses pane container on desktop', async () => {
    mockMatchMedia(false) // Desktop

    render(<GlassMagnifier {...defaultProps} />)

    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!
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

    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!
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

  it('onShow callback hides hint', async () => {
    let capturedOnShow: (() => void) | undefined

    MockedDrift.mockImplementation(
      (
        _el: HTMLElement,
        options: { onShow?: () => void; onHide?: () => void }
      ) => {
        capturedOnShow = options.onShow
        return createMockDrift()
      }
    )

    render(<GlassMagnifier {...defaultProps} />)
    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!

    // Hint should be visible initially
    expect(screen.getByText(/hoverToZoom/i)).toBeInTheDocument()

    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalled()
    })

    // Call the captured onShow callback wrapped in act
    await act(async () => {
      if (capturedOnShow) {
        capturedOnShow()
      }
    })

    // Hint should be hidden after onShow
    await waitFor(() => {
      expect(screen.queryByText(/hoverToZoom/i)).not.toBeInTheDocument()
    })
  })

  it('onShow and onHide callbacks execute without errors', async () => {
    let capturedOnShow: (() => void) | undefined
    let capturedOnHide: (() => void) | undefined

    MockedDrift.mockImplementation(
      (
        _el: HTMLElement,
        options: { onShow?: () => void; onHide?: () => void }
      ) => {
        capturedOnShow = options.onShow
        capturedOnHide = options.onHide
        return createMockDrift()
      }
    )

    render(<GlassMagnifier {...defaultProps} />)
    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!

    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalled()
    })

    // Verify callbacks are defined and can be called without throwing
    expect(capturedOnShow).toBeDefined()
    expect(capturedOnHide).toBeDefined()

    // Call onShow - should not throw
    await act(async () => {
      expect(() => capturedOnShow?.()).not.toThrow()
    })

    // Call onHide - should not throw
    await act(async () => {
      expect(() => capturedOnHide?.()).not.toThrow()
    })
  })

  it('handles Drift initialization error gracefully', async () => {
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {})
    MockedDrift.mockImplementation(() => {
      throw new Error('Drift init failed')
    })

    render(<GlassMagnifier {...defaultProps} />)

    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!
    fireEvent.load(img)

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to initialize Drift magnifier:',
        expect.any(Error)
      )
    })

    consoleWarnSpy.mockRestore()
  })

  it('destroys Drift when switching to mobile', async () => {
    mockMatchMedia(false) // Start as desktop
    const { rerender } = render(<GlassMagnifier {...defaultProps} />)

    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!
    fireEvent.load(img)

    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalledTimes(1)
    })

    // Simulate resize to mobile
    mockMatchMedia(true)
    fireEvent(window, new Event('resize'))

    // Force rerender to pick up new matchMedia
    rerender(<GlassMagnifier {...defaultProps} />)

    // Wait for destroy - Drift should be destroyed but NOT reinitialized on mobile
    await waitFor(() => {
      expect(mockDestroyFn).toHaveBeenCalled()
    })

    // Still only one Drift call (the initial desktop one)
    expect(MockedDrift).toHaveBeenCalledTimes(1)
  })

  it('reinitializes Drift when switching from mobile to desktop', async () => {
    mockMatchMedia(true) // Start as mobile
    const { rerender } = render(<GlassMagnifier {...defaultProps} />)

    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!
    fireEvent.load(img)

    // Drift should NOT be initialized on mobile
    await waitFor(() => {
      expect(MockedDrift).not.toHaveBeenCalled()
    })

    // Simulate resize to desktop
    mockMatchMedia(false)
    fireEvent(window, new Event('resize'))

    // Force rerender to pick up new matchMedia
    rerender(<GlassMagnifier {...defaultProps} />)

    // Now Drift should be initialized for desktop
    await waitFor(() => {
      expect(MockedDrift).toHaveBeenCalledTimes(1)
    })
  })

  it('still renders container and image on mobile (without magnifier features)', () => {
    mockMatchMedia(true) // Mobile

    render(<GlassMagnifier {...defaultProps} />)

    // Container should still render
    const container = screen.getByTestId('glass-magnifier')
    expect(container).toBeInTheDocument()

    // Image should still be present
    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('alt', 'Test painting')
  })

  it('does not initialize Drift before image loads', () => {
    render(<GlassMagnifier {...defaultProps} />)
    // Drift should not be called until image loads
    expect(MockedDrift).not.toHaveBeenCalled()
  })

  it('calls onError callback when image fails to load', () => {
    const onErrorMock = jest.fn()
    render(<GlassMagnifier {...defaultProps} onError={onErrorMock} />)

    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!
    fireEvent.error(img)

    expect(onErrorMock).toHaveBeenCalledTimes(1)
  })

  it('does not throw when onError is not provided and image fails', () => {
    render(<GlassMagnifier {...defaultProps} />)

    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!

    // Should not throw
    expect(() => fireEvent.error(img)).not.toThrow()
  })

  it('does not reinitialize Drift if already initialized with same settings', async () => {
    mockMatchMedia(false) // Desktop

    render(<GlassMagnifier {...defaultProps} />)

    const container = screen.getByTestId('glass-magnifier')
    const img = container.querySelector('img')!
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

      expect(container).toHaveAttribute('role', 'img')
      expect(container).toHaveAttribute('aria-label', 'Test painting')
      expect(container).toHaveAttribute('tabIndex', '0')
    })

    it('has same ARIA label on mobile (just alt text)', () => {
      mockMatchMedia(true) // Mobile
      render(<GlassMagnifier {...defaultProps} />)
      const container = screen.getByTestId('glass-magnifier')

      // Same aria-label on mobile and desktop - just the alt text
      expect(container).toHaveAttribute('aria-label', 'Test painting')
    })

    it('responds to keyboard interaction on desktop', () => {
      mockMatchMedia(false) // Desktop
      render(<GlassMagnifier {...defaultProps} />)
      const container = screen.getByTestId('glass-magnifier')

      // Initially shows hint (translation mock returns the key)
      expect(screen.getByText(/hoverToZoom/i)).toBeInTheDocument()

      // Press Enter to toggle hint
      fireEvent.keyDown(container, { key: 'Enter' })
      expect(screen.queryByText(/hoverToZoom/i)).not.toBeInTheDocument()

      // Press Space to toggle hint back
      fireEvent.keyDown(container, { key: ' ' })
      expect(screen.getByText(/hoverToZoom/i)).toBeInTheDocument()
    })

    it('has aria-hidden on zoom indicator (desktop only)', () => {
      mockMatchMedia(false) // Desktop
      render(<GlassMagnifier {...defaultProps} />)
      const indicator = screen
        .getByTestId('glass-magnifier')
        .querySelector('div > svg')?.parentElement
      expect(indicator).toHaveAttribute('aria-hidden', 'true')
    })

    it('has aria-live on hint for screen readers (desktop only)', () => {
      mockMatchMedia(false) // Desktop
      render(<GlassMagnifier {...defaultProps} />)
      // Translation mock returns the key
      const hint = screen.getByText(/hoverToZoom/i).parentElement
      expect(hint).toHaveAttribute('aria-live', 'polite')
    })
  })
})
