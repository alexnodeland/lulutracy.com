import React, { useState, useEffect, useRef, useCallback } from 'react'
import { navigate, withPrefix } from 'gatsby'
import { useLocation } from './LocationContext'
import * as styles from './PageTransition.module.css'

// Get path prefix reliably using Gatsby's withPrefix
// withPrefix('/') returns '/lulutracy.com/' in production, '/' in dev
const getPathPrefix = (): string => {
  const prefixedRoot = withPrefix('/')
  // Remove trailing slash to get just the prefix
  return prefixedRoot.length > 1 ? prefixedRoot.slice(0, -1) : ''
}

// Must match --transition-fast in global.css
const TRANSITION_DURATION = 500

interface PageTransitionProps {
  children: React.ReactNode
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const [transitionChildren, setTransitionChildren] = useState(children)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const previousPathRef = useRef(location.pathname)
  const isFirstRender = useRef(true)

  // Handle fade in on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timeout)
  }, [])

  // Handle route changes
  useEffect(() => {
    // Skip first render - handled by mount effect
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Path changed - fade out, swap content, fade in
    if (location.pathname !== previousPathRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: need to freeze children during transition
      setIsTransitioning(true)
      // After transition, update children and fade back in
      const timeout = setTimeout(() => {
        setTransitionChildren(children)
        previousPathRef.current = location.pathname
        setIsTransitioning(false)
        setIsVisible(true)
      }, TRANSITION_DURATION)

      return () => clearTimeout(timeout)
    }
  }, [location.pathname, children])

  // Sync children when not transitioning (same path, children changed)
  const displayChildren = isTransitioning ? transitionChildren : children

  // Intercept internal link clicks for fade-out effect
  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Only handle internal links (starting with /)
      if (!href.startsWith('/')) return

      // Don't handle if modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.shiftKey) return

      // Strip path prefix for comparison and navigation
      // In production, href includes prefix (e.g., /lulutracy.com/about)
      // but navigate() expects path without prefix (e.g., /about)
      const pathPrefix = getPathPrefix()
      const normalizedHref =
        pathPrefix && href.startsWith(pathPrefix)
          ? href.slice(pathPrefix.length) || '/'
          : href

      // Don't handle same-page links
      if (normalizedHref === location.pathname) return

      e.preventDefault()
      setIsVisible(false)

      setTimeout(() => {
        navigate(normalizedHref)
      }, TRANSITION_DURATION)
    },
    [location.pathname]
  )

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [handleClick])

  return (
    <div
      className={`${styles.pageTransition} ${isVisible ? styles.visible : ''}`}
    >
      {displayChildren}
    </div>
  )
}

export default PageTransition
