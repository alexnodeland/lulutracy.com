import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Layout from '../Layout'

describe('Layout', () => {
  it('renders children', () => {
    render(
      <Layout>
        <div data-testid="test-child">Test Content</div>
      </Layout>
    )
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders header', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders footer', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders main content area', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('toggles navigation menu when clicking hamburger', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    const menuButton = screen.getByRole('button', {
      name: /toggle navigation menu/i,
    })
    fireEvent.click(menuButton)

    // Both navigations should be visible (desktop nav in header + mobile nav panel)
    const navElements = screen.getAllByRole('navigation')
    expect(navElements.length).toBe(2)
  })
})
