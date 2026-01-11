import React from 'react'
import { render, screen } from '@testing-library/react'
import SkeletonLoader from '../SkeletonLoader'

describe('SkeletonLoader', () => {
  it('renders with default props', () => {
    render(<SkeletonLoader />)
    const skeleton = screen.getByRole('progressbar')
    expect(skeleton).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<SkeletonLoader className="custom-class" />)
    const skeleton = screen.getByRole('progressbar')
    expect(skeleton).toHaveClass('custom-class')
  })

  it('applies custom width', () => {
    render(<SkeletonLoader width="200px" />)
    const skeleton = screen.getByRole('progressbar')
    expect(skeleton).toHaveStyle({ width: '200px' })
  })

  it('applies custom height', () => {
    render(<SkeletonLoader height="100px" />)
    const skeleton = screen.getByRole('progressbar')
    expect(skeleton).toHaveStyle({ height: '100px' })
  })

  it('sets aspectRatio in style attribute', () => {
    render(<SkeletonLoader aspectRatio="16/9" />)
    const skeleton = screen.getByRole('progressbar')
    // Check the style attribute directly since jsdom may not fully support aspectRatio
    expect(skeleton.style.aspectRatio).toBe('16/9')
  })

  it('applies custom border radius', () => {
    render(<SkeletonLoader borderRadius="8px" />)
    const skeleton = screen.getByRole('progressbar')
    expect(skeleton).toHaveStyle({ borderRadius: '8px' })
  })

  it('has aria-busy attribute', () => {
    render(<SkeletonLoader />)
    const skeleton = screen.getByRole('progressbar')
    expect(skeleton).toHaveAttribute('aria-busy', 'true')
  })

  it('applies custom aria-label', () => {
    render(<SkeletonLoader ariaLabel="Loading content" />)
    const skeleton = screen.getByRole('progressbar')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
  })

  it('has role="progressbar" for accessibility', () => {
    render(<SkeletonLoader />)
    const skeleton = screen.getByRole('progressbar')
    expect(skeleton).toBeInTheDocument()
  })

  it('uses default aria-label when not provided', () => {
    render(<SkeletonLoader />)
    const skeleton = screen.getByRole('progressbar')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading...')
  })

  it('uses default width when not provided', () => {
    render(<SkeletonLoader />)
    const skeleton = screen.getByRole('progressbar')
    expect(skeleton).toHaveStyle({ width: '100%' })
  })

  it('uses default borderRadius when not provided', () => {
    render(<SkeletonLoader />)
    const skeleton = screen.getByRole('progressbar')
    expect(skeleton).toHaveStyle({ borderRadius: '0' })
  })

  it('combines width and height props', () => {
    render(<SkeletonLoader width="300px" height="200px" />)
    const skeleton = screen.getByRole('progressbar')
    expect(skeleton).toHaveStyle({
      width: '300px',
      height: '200px',
    })
  })
})
