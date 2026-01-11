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

// Normalize a path by stripping the path prefix and trailing slash
const normalizePath = (path: string): string => {
  const pathPrefix = getPathPrefix()
  let normalized =
    pathPrefix && path.startsWith(pathPrefix)
      ? path.slice(pathPrefix.length) || '/'
      : path
  // Remove trailing slash (except for root)
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

// Supported languages for detecting language-only route changes
const SUPPORTED_LANGUAGES = ['en', 'zh', 'yue', 'ms']

// Extract the base path without language prefix
// e.g., '/zh/about' -> '/about', '/about' -> '/about', '/zh' -> '/'
const getBasePath = (path: string): string => {
  const normalized = normalizePath(path)
  for (const lang of SUPPORTED_LANGUAGES) {
    if (normalized === `/${lang}`) {
      return '/'
    }
    if (normalized.startsWith(`/${lang}/`)) {
      return normalized.slice(lang.length + 1)
    }
  }
  return normalized
}

// Must match --transition-fast in global.css
const TRANSITION_DURATION = 500

// Session storage key for skipping transition on language changes
const SKIP_TRANSITION_KEY = 'pageTransition:skipNext'

// Check if we should skip the initial fade-in (e.g., after language change)
const shouldSkipInitialTransition = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const skip = sessionStorage.getItem(SKIP_TRANSITION_KEY)
    if (skip === 'true') {
      sessionStorage.removeItem(SKIP_TRANSITION_KEY)
      return true
    }
  } catch {
    // sessionStorage not available
  }
  return false
}

// Mark that the next page load should skip the transition
export const skipNextTransition = (): void => {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SKIP_TRANSITION_KEY, 'true')
  } catch {
    // sessionStorage not available
  }
}

interface PageTransitionProps {
  children: React.ReactNode
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation()
  // Check if we should skip transition on mount (e.g., language change)
  // Use lazy initializer to only check once on mount
  const [initialSkip] = useState(shouldSkipInitialTransition)
  const [isVisible, setIsVisible] = useState(initialSkip)
  // Use instant mode (no CSS transition) when skipping
  const [isInstant, setIsInstant] = useState(initialSkip)
  const [transitionChildren, setTransitionChildren] = useState(children)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const previousPathRef = useRef(location.pathname)
  const isFirstRender = useRef(true)
  const hasProcessedSkip = useRef(false)

  // Handle fade in on mount
  useEffect(() => {
    // If we're skipping transition, we're already visible with instant mode
    // Clear instant mode after the component has rendered
    if (initialSkip && !hasProcessedSkip.current) {
      hasProcessedSkip.current = true
      // Use requestAnimationFrame to ensure the instant render happened
      const raf = requestAnimationFrame(() => {
        setIsInstant(false)
      })
      return () => cancelAnimationFrame(raf)
    }

    // Normal fade-in for fresh page loads
    const timeout = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timeout)
  }, [initialSkip])

  // Handle route changes
  useEffect(() => {
    // Skip first render - handled by mount effect
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Path changed
    if (location.pathname !== previousPathRef.current) {
      const previousBasePath = getBasePath(previousPathRef.current)
      const newBasePath = getBasePath(location.pathname)

      // Language-only change (same base path) - update instantly without transition
      if (previousBasePath === newBasePath) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: instant update for language changes
        setTransitionChildren(children)
        previousPathRef.current = location.pathname
        return
      }

      // Different page - fade out, swap content, fade in
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

      // Normalize both paths for comparison (strips prefix and trailing slash)
      // In production, href includes prefix (e.g., /lulutracy.com/about)
      // but navigate() expects path without prefix (e.g., /about)
      const normalizedHref = normalizePath(href)
      const normalizedCurrentPath = normalizePath(location.pathname)

      // Don't handle same-page links
      if (normalizedHref === normalizedCurrentPath) return

      // Check if this is a language-only change (same base path)
      const currentBasePath = getBasePath(normalizedCurrentPath)
      const targetBasePath = getBasePath(normalizedHref)

      if (currentBasePath === targetBasePath) {
        // Language-only change - navigate immediately without transition
        e.preventDefault()
        navigate(normalizedHref)
        return
      }

      // Different page - fade out then navigate
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

  // Determine the appropriate class: instant (no transition), visible (with transition), or hidden
  const visibilityClass = isInstant
    ? styles.instant
    : isVisible
      ? styles.visible
      : ''

  return (
    <div className={`${styles.pageTransition} ${visibilityClass}`}>
      {displayChildren}
    </div>
  )
}

export default PageTransition
