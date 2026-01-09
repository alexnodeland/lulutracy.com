import React from 'react'
import { render, screen } from '@testing-library/react'
import NotFoundPage from '../404'

describe('NotFoundPage', () => {
  it('renders the page', () => {
    render(<NotFoundPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('displays "Page Not Found" heading', () => {
    render(<NotFoundPage />)
    expect(
      screen.getByRole('heading', { name: /page not found/i })
    ).toBeInTheDocument()
  })

  it('displays a message about the page not existing', () => {
    render(<NotFoundPage />)
    expect(screen.getByText(/doesn't exist/i)).toBeInTheDocument()
  })

  it('has a link to return to the gallery', () => {
    render(<NotFoundPage />)
    const link = screen.getByRole('link', { name: /return to gallery/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })
})
