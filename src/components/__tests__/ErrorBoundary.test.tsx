import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'

// Component that throws an error conditionally
let shouldThrow = false
const ThrowError: React.FC = () => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Suppress console.error for cleaner test output
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalError
})

beforeEach(() => {
  shouldThrow = false
})

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders error UI when a child component throws', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(
      screen.getByText(/we apologize for the inconvenience/i)
    ).toBeInTheDocument()
  })

  it('renders Go Home button in error state', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    const homeButton = screen.getByRole('button', { name: /go home/i })
    expect(homeButton).toBeInTheDocument()
  })

  it('renders Try Again button in error state', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    expect(tryAgainButton).toBeInTheDocument()
  })

  it('resets error state when Try Again button is clicked', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Reset the throw flag so it doesn't throw on re-render
    shouldThrow = false

    // Click Try Again
    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(tryAgainButton)

    // Should now show children again
    expect(screen.getByText('No error')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('navigates to home when Go Home button is clicked', () => {
    const mockHref = jest.fn()
    const originalLocation = window.location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).location = { ...originalLocation, href: '' }
    Object.defineProperty(window.location, 'href', {
      set: mockHref,
    })

    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    const homeButton = screen.getByRole('button', { name: /go home/i })
    fireEvent.click(homeButton)

    expect(mockHref).toHaveBeenCalledWith('/')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).location = originalLocation
  })

  it('does not render error UI when children render successfully', () => {
    shouldThrow = false
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText('No error')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('uses custom fallback when provided', () => {
    shouldThrow = true
    const customFallback = <div>Custom error message</div>
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('has alert role for accessibility', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('logs error to console in componentDidCatch', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(console.error).toHaveBeenCalled()
  })
})
