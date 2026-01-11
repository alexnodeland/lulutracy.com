import React from 'react'
import { render, screen } from '@testing-library/react'
import NotFoundPage, { Head } from '../404'

// Mock ThemeContext to avoid ThemeProvider requirement
jest.mock('../../components/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: jest.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const mockData = {
  siteYaml: {
    site: {
      name: 'lulutracy',
    },
  },
}

// Cast to any to bypass Gatsby PageProps typing in tests
const renderNotFoundPage = () => {
  return render(<NotFoundPage data={mockData} {...({} as any)} />)
}

describe('NotFoundPage', () => {
  it('renders the page', () => {
    renderNotFoundPage()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('displays "Page Not Found" heading', () => {
    renderNotFoundPage()
    expect(
      screen.getByRole('heading', { name: /page not found/i })
    ).toBeInTheDocument()
  })

  it('displays a message about the page not existing', () => {
    renderNotFoundPage()
    expect(screen.getByText(/doesn't exist/i)).toBeInTheDocument()
  })

  it('has a link to return to the gallery', () => {
    renderNotFoundPage()
    const link = screen.getByRole('link', { name: /return to gallery/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })
})

describe('Head', () => {
  it('renders noindex meta tag', () => {
    const { container } = render(<Head data={mockData} {...({} as any)} />)
    expect(container.querySelector('title')).toHaveTextContent(
      'Page Not Found | lulutracy'
    )
    expect(container.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow'
    )
  })

  it('falls back to default site name when missing', () => {
    const dataWithoutSiteName = {
      siteYaml: {
        site: {},
      },
    }
    const { container } = render(
      <Head data={dataWithoutSiteName as any} {...({} as any)} />
    )
    expect(container.querySelector('title')).toHaveTextContent(
      'Page Not Found | lulutracy'
    )
  })

  it('falls back to default language when pageContext missing', () => {
    const { container } = render(<Head data={mockData} {...({} as any)} />)
    expect(container.querySelector('html')).toHaveAttribute('lang', 'en')
  })
})
