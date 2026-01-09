import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Navigation from '../Navigation'

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
})
