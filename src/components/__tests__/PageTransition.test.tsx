import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import PageTransition from '../PageTransition'
import { LocationProvider } from '../LocationContext'

// Mock gatsby navigate and withPrefix
const mockNavigate = jest.fn()
const mockWithPrefix = jest.fn((path: string) => path)
jest.mock('gatsby', () => ({
  ...jest.requireActual('gatsby'),
  navigate: (path: string) => mockNavigate(path),
  withPrefix: (path: string) => mockWithPrefix(path),
}))

const renderWithLocation = (
  children: React.ReactNode,
  pathname: string = '/'
) => {
  return render(
    <LocationProvider location={{ pathname }}>{children}</LocationProvider>
  )
}

describe('PageTransition', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockNavigate.mockClear()
    mockWithPrefix.mockClear()
    mockWithPrefix.mockImplementation((path: string) => path)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders children', () => {
    renderWithLocation(
      <PageTransition>
        <div>Test content</div>
      </PageTransition>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('fades in after mount delay', () => {
    renderWithLocation(
      <PageTransition>
        <div>Test content</div>
      </PageTransition>
    )

    // Content should be rendered
    expect(screen.getByText('Test content')).toBeInTheDocument()

    // Advance past the fade-in delay
    act(() => {
      jest.advanceTimersByTime(50)
    })

    // Content should still be rendered after fade-in
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('handles internal link clicks with fade out and navigation', () => {
    renderWithLocation(
      <PageTransition>
        <a href="/about">About</a>
      </PageTransition>,
      '/'
    )

    act(() => {
      jest.advanceTimersByTime(50)
    })

    const link = screen.getByText('About')
    fireEvent.click(link)

    // Navigation should not happen immediately
    expect(mockNavigate).not.toHaveBeenCalled()

    // After transition duration, navigation should occur
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/about')
  })

  it('does not intercept external links', () => {
    renderWithLocation(
      <PageTransition>
        <a href="https://example.com">External</a>
      </PageTransition>
    )

    act(() => {
      jest.advanceTimersByTime(50)
    })

    const link = screen.getByText('External')
    fireEvent.click(link)

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not intercept clicks with modifier keys', () => {
    renderWithLocation(
      <PageTransition>
        <a href="/about">About</a>
      </PageTransition>
    )

    act(() => {
      jest.advanceTimersByTime(50)
    })

    const link = screen.getByText('About')

    fireEvent.click(link, { metaKey: true })
    expect(mockNavigate).not.toHaveBeenCalled()

    fireEvent.click(link, { ctrlKey: true })
    expect(mockNavigate).not.toHaveBeenCalled()

    fireEvent.click(link, { shiftKey: true })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not intercept same-page links', () => {
    renderWithLocation(
      <PageTransition>
        <a href="/">Home</a>
      </PageTransition>,
      '/'
    )

    act(() => {
      jest.advanceTimersByTime(50)
    })

    const link = screen.getByText('Home')
    fireEvent.click(link)

    // Should not navigate for same-page links
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('updates children when they change on same path', () => {
    const { rerender } = renderWithLocation(
      <PageTransition>
        <div>Initial content</div>
      </PageTransition>
    )

    act(() => {
      jest.advanceTimersByTime(50)
    })

    expect(screen.getByText('Initial content')).toBeInTheDocument()

    rerender(
      <LocationProvider location={{ pathname: '/' }}>
        <PageTransition>
          <div>Updated content</div>
        </PageTransition>
      </LocationProvider>
    )

    expect(screen.getByText('Updated content')).toBeInTheDocument()
  })

  it('handles route changes with fade transition', () => {
    const { rerender } = renderWithLocation(
      <PageTransition>
        <div>Page 1</div>
      </PageTransition>,
      '/'
    )

    act(() => {
      jest.advanceTimersByTime(50)
    })

    expect(screen.getByText('Page 1')).toBeInTheDocument()

    // Simulate route change
    rerender(
      <LocationProvider location={{ pathname: '/about' }}>
        <PageTransition>
          <div>Page 2</div>
        </PageTransition>
      </LocationProvider>
    )

    // After transition duration, new content should appear
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(screen.getByText('Page 2')).toBeInTheDocument()
  })

  it('does not handle clicks on non-anchor elements', () => {
    renderWithLocation(
      <PageTransition>
        <button>Click me</button>
      </PageTransition>
    )

    act(() => {
      jest.advanceTimersByTime(50)
    })

    const button = screen.getByText('Click me')
    fireEvent.click(button)

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not handle anchor without href', () => {
    renderWithLocation(
      <PageTransition>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a>No href</a>
      </PageTransition>
    )

    act(() => {
      jest.advanceTimersByTime(50)
    })

    const link = screen.getByText('No href')
    fireEvent.click(link)

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  describe('with path prefix', () => {
    beforeEach(() => {
      mockWithPrefix.mockImplementation(
        (path: string) => `/lulutracy.com${path}`
      )
    })

    it('strips path prefix from href before navigating', () => {
      renderWithLocation(
        <PageTransition>
          <a href="/lulutracy.com/about">About</a>
        </PageTransition>,
        '/'
      )

      act(() => {
        jest.advanceTimersByTime(50)
      })

      const link = screen.getByText('About')
      fireEvent.click(link)

      act(() => {
        jest.advanceTimersByTime(500)
      })

      // Should navigate with stripped prefix
      expect(mockNavigate).toHaveBeenCalledWith('/about')
    })

    it('handles root path with prefix correctly', () => {
      renderWithLocation(
        <PageTransition>
          <a href="/lulutracy.com">Home</a>
        </PageTransition>,
        '/about'
      )

      act(() => {
        jest.advanceTimersByTime(50)
      })

      const link = screen.getByText('Home')
      fireEvent.click(link)

      act(() => {
        jest.advanceTimersByTime(500)
      })

      // Should navigate to root when prefix is stripped and nothing remains
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('does not strip prefix for non-prefixed paths', () => {
      renderWithLocation(
        <PageTransition>
          <a href="/about">About</a>
        </PageTransition>,
        '/'
      )

      act(() => {
        jest.advanceTimersByTime(50)
      })

      const link = screen.getByText('About')
      fireEvent.click(link)

      act(() => {
        jest.advanceTimersByTime(500)
      })

      // Should navigate with original path
      expect(mockNavigate).toHaveBeenCalledWith('/about')
    })

    it('does not intercept same-page links when location.pathname includes prefix', () => {
      // Simulate production environment where location.pathname includes the path prefix
      renderWithLocation(
        <PageTransition>
          <a href="/lulutracy.com/about">About</a>
        </PageTransition>,
        '/lulutracy.com/about'
      )

      act(() => {
        jest.advanceTimersByTime(50)
      })

      const link = screen.getByText('About')
      fireEvent.click(link)

      // Should not navigate for same-page links (even with prefix in pathname)
      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('does not intercept same-page links with trailing slash differences', () => {
      // Simulate case where href has no trailing slash but pathname does
      renderWithLocation(
        <PageTransition>
          <a href="/lulutracy.com/about">About</a>
        </PageTransition>,
        '/lulutracy.com/about/'
      )

      act(() => {
        jest.advanceTimersByTime(50)
      })

      const link = screen.getByText('About')
      fireEvent.click(link)

      // Should not navigate for same-page links (even with trailing slash difference)
      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('does not intercept same-page links at root with prefix', () => {
      // Simulate clicking logo on homepage in production
      renderWithLocation(
        <PageTransition>
          <a href="/lulutracy.com/">Home</a>
        </PageTransition>,
        '/lulutracy.com/'
      )

      act(() => {
        jest.advanceTimersByTime(50)
      })

      const link = screen.getByText('Home')
      fireEvent.click(link)

      // Should not navigate for same-page links
      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
