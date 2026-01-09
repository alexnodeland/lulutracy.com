import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../Header'

describe('Header', () => {
  const mockOnMenuToggle = jest.fn()

  beforeEach(() => {
    mockOnMenuToggle.mockClear()
  })

  it('renders the logo', () => {
    render(<Header onMenuToggle={mockOnMenuToggle} />)
    expect(screen.getByLabelText('Lulu Tracy - Home')).toBeInTheDocument()
  })

  it('renders the menu button', () => {
    render(<Header onMenuToggle={mockOnMenuToggle} />)
    expect(
      screen.getByRole('button', { name: /toggle navigation menu/i })
    ).toBeInTheDocument()
  })

  it('calls onMenuToggle when menu button is clicked', () => {
    render(<Header onMenuToggle={mockOnMenuToggle} />)
    const menuButton = screen.getByRole('button', {
      name: /toggle navigation menu/i,
    })

    fireEvent.click(menuButton)
    expect(mockOnMenuToggle).toHaveBeenCalledTimes(1)
  })

  it('logo links to homepage', () => {
    render(<Header onMenuToggle={mockOnMenuToggle} />)
    const logoLink = screen.getByLabelText('Lulu Tracy - Home')
    expect(logoLink).toHaveAttribute('href', '/')
  })
})
