import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SkipLink from '../SkipLink'

describe('SkipLink', () => {
  beforeEach(() => {
    // Create a target element for the skip link
    const target = document.createElement('main')
    target.id = 'main-content'
    target.tabIndex = -1
    document.body.appendChild(target)
  })

  afterEach(() => {
    const target = document.getElementById('main-content')
    if (target) {
      document.body.removeChild(target)
    }
  })

  it('renders the skip link with translated text', () => {
    render(<SkipLink targetId="main-content" />)
    // The mock returns the key, but with fallback it shows the fallback text
    expect(screen.getByRole('link')).toBeInTheDocument()
  })

  it('has correct href attribute', () => {
    render(<SkipLink targetId="main-content" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '#main-content')
  })

  it('focuses the target element on click', () => {
    render(<SkipLink targetId="main-content" />)
    const link = screen.getByRole('link')
    const target = document.getElementById('main-content')

    fireEvent.click(link)

    expect(document.activeElement).toBe(target)
  })

  it('calls scrollIntoView on the target', () => {
    render(<SkipLink targetId="main-content" />)
    const link = screen.getByRole('link')
    const target = document.getElementById('main-content')
    const scrollSpy = jest.spyOn(target!, 'scrollIntoView')

    fireEvent.click(link)

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('prevents default link behavior', () => {
    render(<SkipLink targetId="main-content" />)
    const link = screen.getByRole('link')
    const clickEvent = new MouseEvent('click', { bubbles: true })
    const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault')

    link.dispatchEvent(clickEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('handles missing target element gracefully', () => {
    // Remove the target element
    const target = document.getElementById('main-content')
    if (target) {
      document.body.removeChild(target)
    }

    render(<SkipLink targetId="non-existent" />)
    const link = screen.getByRole('link')

    // Should not throw when clicking
    expect(() => fireEvent.click(link)).not.toThrow()
  })

  it('uses default targetId when not provided', () => {
    render(<SkipLink />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '#main-content')
  })
})
