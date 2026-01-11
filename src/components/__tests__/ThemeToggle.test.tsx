import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeToggle from '../ThemeToggle'
import { ThemeProvider } from '../ThemeContext'

// Mock the useTranslation hook
jest.mock('gatsby-plugin-react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'theme.switchToDark': 'Switch to dark mode',
        'theme.switchToLight': 'Switch to light mode',
      }
      return translations[key] || key
    },
  }),
}))

// Helper to render with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  // Mock localStorage and matchMedia before rendering
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

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
    writable: true,
  })

  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it('renders a button', () => {
    renderWithTheme(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has correct aria-label for light mode (switch to dark)', () => {
    renderWithTheme(<ThemeToggle />)
    expect(
      screen.getByRole('button', { name: 'Switch to dark mode' })
    ).toBeInTheDocument()
  })

  it('toggles theme when clicked', () => {
    renderWithTheme(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')

    fireEvent.click(button)

    expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
  })

  it('updates aria-label based on current theme', () => {
    renderWithTheme(<ThemeToggle />)

    const button = screen.getByRole('button')

    // In light mode, should show "switch to dark"
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')

    // Click to switch to dark mode
    fireEvent.click(button)

    // In dark mode, should show "switch to light"
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode')

    // Click to switch back to light mode
    fireEvent.click(button)

    // Should be back to "switch to dark"
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
  })

  it('contains SVG icons', () => {
    renderWithTheme(<ThemeToggle />)

    const button = screen.getByRole('button')
    const svgs = button.querySelectorAll('svg')

    // Should have both sun and moon icons
    expect(svgs.length).toBe(2)
  })

  it('has type="button" attribute', () => {
    renderWithTheme(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })
})
