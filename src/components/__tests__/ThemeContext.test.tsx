import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeContext'

// Test component that uses the theme context
const TestComponent: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
    }
  })()

  // Mock matchMedia
  const createMatchMedia = (matches: boolean) => {
    return (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })
  }

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    localStorageMock.clear()

    // Default to light mode system preference
    Object.defineProperty(window, 'matchMedia', {
      value: createMatchMedia(false),
      writable: true,
    })

    // Reset document attribute
    document.documentElement.removeAttribute('data-theme')
  })

  it('provides default light theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // After mount effect runs, theme should be set
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
  })

  it('toggles theme when toggleTheme is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /toggle/i })
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')

    act(() => {
      fireEvent.click(button)
    })

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')

    act(() => {
      fireEvent.click(button)
    })

    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
  })

  it('persists theme to localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /toggle/i })

    act(() => {
      fireEvent.click(button)
    })

    expect(localStorageMock.getItem('theme')).toBe('dark')
  })

  it('reads theme from localStorage on mount', () => {
    localStorageMock.setItem('theme', 'dark')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
  })

  it('respects system dark mode preference when no localStorage value', () => {
    Object.defineProperty(window, 'matchMedia', {
      value: createMatchMedia(true), // System prefers dark
      writable: true,
    })

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
  })

  it('sets data-theme attribute on document element', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /toggle/i })

    act(() => {
      fireEvent.click(button)
    })

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    )

    consoleSpy.mockRestore()
  })

  it('localStorage preference overrides system preference', () => {
    Object.defineProperty(window, 'matchMedia', {
      value: createMatchMedia(true), // System prefers dark
      writable: true,
    })
    localStorageMock.setItem('theme', 'light') // User prefers light

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
  })

  it('updates theme when system preference changes and no stored value', async () => {
    // Create a more sophisticated matchMedia mock that tracks listeners
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null
    const mockMediaQueryList = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(
        (event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            changeHandler = handler
          }
        }
      ),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }

    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockReturnValue(mockMediaQueryList),
      writable: true,
    })

    // No localStorage value set - this is important for the branch coverage
    localStorageMock.clear()

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Initially light (system preference is false)
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')

    // Simulate system preference change to dark
    // Note: After this, localStorage will be set due to the theme change effect
    await act(async () => {
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent)
      }
    })

    // Theme should update to dark since there was no stored preference initially
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
  })

  it('does not update theme on system preference change when user has stored preference', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null
    const mockMediaQueryList = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(
        (event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            changeHandler = handler
          }
        }
      ),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }

    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockReturnValue(mockMediaQueryList),
      writable: true,
    })

    // User has explicitly set light theme
    localStorageMock.setItem('theme', 'light')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')

    // Simulate system preference change to dark
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent)
      }
    })

    // Theme should stay light because user has a stored preference
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
  })

  it('cleans up event listener on unmount', () => {
    const removeEventListenerMock = jest.fn()
    const mockMediaQueryList = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: removeEventListenerMock,
      dispatchEvent: jest.fn(),
    }

    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockReturnValue(mockMediaQueryList),
      writable: true,
    })

    const { unmount } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    unmount()

    expect(removeEventListenerMock).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('sets document attribute on initial mount', () => {
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Should set the attribute on initial mount
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
