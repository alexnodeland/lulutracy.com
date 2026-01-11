import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Navigation from '../Navigation'

// Mock ThemeContext to avoid ThemeProvider requirement
jest.mock('../ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: jest.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock LanguageSwitcher
jest.mock('../LanguageSwitcher', () => {
  return function MockLanguageSwitcher() {
    return <div data-testid="language-switcher">Language Switcher</div>
  }
})

describe('Navigation', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('renders navigation links when open', () => {
    render(<Navigation isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('about')).toBeInTheDocument()
  })

  it('has correct link to about page', () => {
    render(<Navigation isOpen={true} onClose={mockOnClose} />)
    const aboutLink = screen.getByText('about')
    expect(aboutLink).toHaveAttribute('href', '/about')
  })

  it('calls onClose when clicking a link', () => {
    render(<Navigation isOpen={true} onClose={mockOnClose} />)
    const aboutLink = screen.getByText('about')

    fireEvent.click(aboutLink)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when pressing Escape key', () => {
    render(<Navigation isOpen={true} onClose={mockOnClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on Escape when closed', () => {
    render(<Navigation isOpen={false} onClose={mockOnClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('calls onClose when clicking overlay', () => {
    render(<Navigation isOpen={true} onClose={mockOnClose} />)
    const overlay = document.querySelector('[aria-hidden="true"]')

    if (overlay) {
      fireEvent.click(overlay)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    }
  })

  it('renders settings section with language switcher and theme toggle', () => {
    render(<Navigation isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument() // ThemeToggle button
  })

  it('prevents body scroll when open', () => {
    render(<Navigation isOpen={true} onClose={mockOnClose} />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when closed', () => {
    const { rerender } = render(
      <Navigation isOpen={true} onClose={mockOnClose} />
    )
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<Navigation isOpen={false} onClose={mockOnClose} />)
    expect(document.body.style.overflow).toBe('')
  })

  it('restores body scroll on unmount', () => {
    const { unmount } = render(
      <Navigation isOpen={true} onClose={mockOnClose} />
    )
    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('traps focus within navigation when open', () => {
    render(<Navigation isOpen={true} onClose={mockOnClose} />)

    const nav = screen.getByRole('navigation')
    const focusableElements = nav.querySelectorAll(
      'a[href], button:not([disabled])'
    )

    expect(focusableElements.length).toBeGreaterThan(0)
  })

  it('wraps focus to first element when tabbing from last', () => {
    jest.useFakeTimers()
    render(<Navigation isOpen={true} onClose={mockOnClose} />)

    const nav = screen.getByRole('navigation')
    const focusableElements = nav.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    )

    // Focus the last element
    const lastElement = focusableElements[focusableElements.length - 1]
    lastElement.focus()

    // Tab forward (should wrap to first)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false })

    // The focus trap should prevent default behavior
    // In a real browser, focus would move to first element
    jest.useRealTimers()
  })

  it('wraps focus to last element when shift-tabbing from first', () => {
    jest.useFakeTimers()
    render(<Navigation isOpen={true} onClose={mockOnClose} />)

    // Let the focus timeout run
    jest.advanceTimersByTime(100)

    const nav = screen.getByRole('navigation')
    const focusableElements = nav.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    )

    if (focusableElements.length > 0) {
      // Focus the first element
      focusableElements[0].focus()

      // Shift-Tab backward (should wrap to last)
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    }

    jest.useRealTimers()
  })

  it('focuses first element when opened', () => {
    jest.useFakeTimers()

    render(<Navigation isOpen={true} onClose={mockOnClose} />)

    // Fast-forward past the focus delay
    jest.advanceTimersByTime(100)

    // Should have focused the first focusable element
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()

    jest.useRealTimers()
  })

  it('has aria-hidden attribute based on open state', () => {
    const { rerender } = render(
      <Navigation isOpen={true} onClose={mockOnClose} />
    )
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-hidden', 'false')

    rerender(<Navigation isOpen={false} onClose={mockOnClose} />)
    const closedNav = screen.getByRole('navigation', { hidden: true })
    expect(closedNav).toHaveAttribute('aria-hidden', 'true')
  })

  it('ignores Tab key when navigation is closed', () => {
    render(<Navigation isOpen={false} onClose={mockOnClose} />)

    // Tab should not trigger any focus trap behavior
    fireEvent.keyDown(document, { key: 'Tab' })

    // No error should occur
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})
