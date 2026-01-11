import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import NetworkStatus from '../NetworkStatus'

// Store original navigator.onLine
const originalOnLine = navigator.onLine

describe('NetworkStatus', () => {
  beforeEach(() => {
    // Reset navigator.onLine to true before each test
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    })
    jest.useFakeTimers()
  })

  afterEach(() => {
    // Restore original navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
      configurable: true,
    })
    jest.useRealTimers()
  })

  it('does not render when online and indicator not shown', () => {
    render(<NetworkStatus />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders offline indicator when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    })

    render(<NetworkStatus />)

    // Simulate offline event
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('offline')).toBeInTheDocument()
  })

  it('shows back online message when connection is restored', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    })

    render(<NetworkStatus />)

    // Simulate offline then online
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(screen.getByText('backOnline')).toBeInTheDocument()
  })

  it('hides back online message after 3 seconds', async () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    })

    render(<NetworkStatus />)

    // Simulate offline then online
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(screen.getByText('backOnline')).toBeInTheDocument()

    // Fast-forward 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  it('has correct aria attributes', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    })

    render(<NetworkStatus />)

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = render(<NetworkStatus />)
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    )

    removeEventListenerSpy.mockRestore()
  })

  it('renders offline icon when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    })

    render(<NetworkStatus />)

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    const icon = screen.getByRole('status').querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})
