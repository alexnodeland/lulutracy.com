import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PaintingNav from '../PaintingNav'

// Mock gatsby-plugin-react-i18next Link
jest.mock('gatsby-plugin-react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string
    children: React.ReactNode
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

describe('PaintingNav', () => {
  const mockPrevPainting = {
    id: 'prev-painting',
    title: 'Previous Painting',
  }

  const mockNextPainting = {
    id: 'next-painting',
    title: 'Next Painting',
  }

  let mockHref: string
  const originalLocation = window.location

  beforeEach(() => {
    mockHref = ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).location = {
      ...originalLocation,
      href: '',
    }
    Object.defineProperty(window.location, 'href', {
      get: () => mockHref,
      set: (value: string) => {
        mockHref = value
      },
    })
  })

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).location = originalLocation
  })

  it('renders navigation element', () => {
    render(
      <PaintingNav
        prevPainting={mockPrevPainting}
        nextPainting={mockNextPainting}
        currentIndex={1}
        totalCount={3}
      />
    )
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders back to gallery link', () => {
    render(
      <PaintingNav
        prevPainting={mockPrevPainting}
        nextPainting={mockNextPainting}
        currentIndex={1}
        totalCount={3}
      />
    )
    const backLinks = screen.getAllByRole('link')
    const homeLink = backLinks.find((link) => link.getAttribute('href') === '/')
    expect(homeLink).toBeInTheDocument()
  })

  it('renders previous link when prevPainting is provided', () => {
    render(
      <PaintingNav
        prevPainting={mockPrevPainting}
        nextPainting={mockNextPainting}
        currentIndex={1}
        totalCount={3}
      />
    )
    const links = screen.getAllByRole('link')
    const prevLink = links.find(
      (link) => link.getAttribute('href') === '/painting/prev-painting'
    )
    expect(prevLink).toBeInTheDocument()
  })

  it('renders next link when nextPainting is provided', () => {
    render(
      <PaintingNav
        prevPainting={mockPrevPainting}
        nextPainting={mockNextPainting}
        currentIndex={1}
        totalCount={3}
      />
    )
    const links = screen.getAllByRole('link')
    const nextLink = links.find(
      (link) => link.getAttribute('href') === '/painting/next-painting'
    )
    expect(nextLink).toBeInTheDocument()
  })

  it('renders disabled previous button when on first painting', () => {
    const { container } = render(
      <PaintingNav
        prevPainting={null}
        nextPainting={mockNextPainting}
        currentIndex={0}
        totalCount={3}
      />
    )
    // When no previous painting, it renders a span instead of a link
    const spans = container.querySelectorAll('span')
    // Should have spans for disabled nav button
    expect(spans.length).toBeGreaterThan(0)
  })

  it('renders disabled next button when on last painting', () => {
    const { container } = render(
      <PaintingNav
        prevPainting={mockPrevPainting}
        nextPainting={null}
        currentIndex={2}
        totalCount={3}
      />
    )
    // When no next painting, it renders a span instead of a link
    const spans = container.querySelectorAll('span')
    expect(spans.length).toBeGreaterThan(0)
  })

  it('displays current position', () => {
    render(
      <PaintingNav
        prevPainting={mockPrevPainting}
        nextPainting={mockNextPainting}
        currentIndex={1}
        totalCount={3}
      />
    )
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('handles keyboard navigation with ArrowLeft', () => {
    render(
      <PaintingNav
        prevPainting={mockPrevPainting}
        nextPainting={mockNextPainting}
        currentIndex={1}
        totalCount={3}
      />
    )

    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(mockHref).toBe('/painting/prev-painting')
  })

  it('handles keyboard navigation with ArrowRight', () => {
    render(
      <PaintingNav
        prevPainting={mockPrevPainting}
        nextPainting={mockNextPainting}
        currentIndex={1}
        totalCount={3}
      />
    )

    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(mockHref).toBe('/painting/next-painting')
  })

  it('does not navigate with ArrowLeft when no previous painting', () => {
    render(
      <PaintingNav
        prevPainting={null}
        nextPainting={mockNextPainting}
        currentIndex={0}
        totalCount={3}
      />
    )

    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(mockHref).toBe('')
  })

  it('does not navigate with ArrowRight when no next painting', () => {
    render(
      <PaintingNav
        prevPainting={mockPrevPainting}
        nextPainting={null}
        currentIndex={2}
        totalCount={3}
      />
    )

    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(mockHref).toBe('')
  })

  it('does not navigate when modifier key is pressed', () => {
    render(
      <PaintingNav
        prevPainting={mockPrevPainting}
        nextPainting={mockNextPainting}
        currentIndex={1}
        totalCount={3}
      />
    )

    fireEvent.keyDown(document, { key: 'ArrowLeft', ctrlKey: true })
    expect(mockHref).toBe('')

    fireEvent.keyDown(document, { key: 'ArrowRight', metaKey: true })
    expect(mockHref).toBe('')
  })

  it('cleans up keyboard event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

    const { unmount } = render(
      <PaintingNav
        prevPainting={mockPrevPainting}
        nextPainting={mockNextPainting}
        currentIndex={1}
        totalCount={3}
      />
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )

    removeEventListenerSpy.mockRestore()
  })

  it('has correct aria-label on navigation', () => {
    render(
      <PaintingNav
        prevPainting={mockPrevPainting}
        nextPainting={mockNextPainting}
        currentIndex={1}
        totalCount={3}
      />
    )
    expect(
      screen.getByRole('navigation', { name: /paintingNavigation/i })
    ).toBeInTheDocument()
  })
})
