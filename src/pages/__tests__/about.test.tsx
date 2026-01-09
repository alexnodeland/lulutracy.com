import React from 'react'
import { render, screen } from '@testing-library/react'
import AboutPage from '../about'

const mockData = {
  markdownRemark: {
    frontmatter: {
      title: 'About',
      artistName: ';-)',
      photo: 'about.jpeg',
    },
    html: '<p>This is the artist biography.</p><p>More content here.</p>',
  },
}

// Cast to any to bypass Gatsby PageProps typing in tests
const renderAboutPage = () => {
  return render(<AboutPage data={mockData} {...({} as any)} />)
}

describe('AboutPage', () => {
  it('renders the page', () => {
    renderAboutPage()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('displays the artist name', () => {
    renderAboutPage()
    expect(screen.getByRole('heading', { name: /;-\)/ })).toBeInTheDocument()
  })

  it('displays the biography content', () => {
    renderAboutPage()
    expect(
      screen.getByText(/This is the artist biography/i)
    ).toBeInTheDocument()
  })

  it('has a contact button', () => {
    renderAboutPage()
    const contactLink = screen.getByRole('link', { name: /contact/i })
    expect(contactLink).toBeInTheDocument()
    expect(contactLink).toHaveAttribute('href', 'mailto:contact@lulutracy.com')
  })

  it('renders the artist photo', () => {
    renderAboutPage()
    const images = screen.getAllByRole('img', { name: /lulu tracy/i })
    // Should have at least one image (logo in header and about photo)
    expect(images.length).toBeGreaterThanOrEqual(1)
  })
})
