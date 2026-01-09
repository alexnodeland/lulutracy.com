import React from 'react'
import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders the footer', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('displays copyright text', () => {
    render(<Footer />)
    expect(screen.getByText(/copyright/i)).toBeInTheDocument()
    expect(screen.getByText(/lulutracy/i)).toBeInTheDocument()
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument()
  })

  it('displays current year', () => {
    const currentYear = new Date().getFullYear()
    render(<Footer />)
    expect(
      screen.getByText(new RegExp(currentYear.toString()))
    ).toBeInTheDocument()
  })
})
