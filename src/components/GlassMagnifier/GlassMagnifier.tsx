import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import * as styles from './GlassMagnifier.module.css'

interface GlassMagnifierProps {
  /** Source URL of the image to display */
  src: string
  /** High-resolution source URL for zoom */
  zoomSrc: string
  /** Alt text for accessibility */
  alt: string
  /** Additional CSS class for the container */
  className?: string
  /** Zoom magnification factor (default: 2) */
  zoomFactor?: number
  /** Enable touch support on mobile (default: true) */
  enableTouch?: boolean
  /** Callback when image fails to load */
  onError?: () => void
}

const GlassMagnifier: React.FC<GlassMagnifierProps> = ({
  src,
  zoomSrc,
  alt,
  className = '',
  zoomFactor = 2,
  enableTouch = true,
  onError,
}) => {
  const { t } = useTranslation('painting')
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const driftRef = useRef<InstanceType<
    typeof import('drift-zoom').default
  > | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showHint, setShowHint] = useState(true)

  // Detect mobile device (SSR-safe)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize Drift when image is loaded (desktop only)
  const initDrift = useCallback(async () => {
    if (!imageRef.current || !containerRef.current) return

    // Destroy existing instance first
    if (driftRef.current) {
      driftRef.current.destroy()
      driftRef.current = null
    }

    // Skip magnifier on mobile - touch interaction is poor UX
    if (isMobile) return

    try {
      const Drift = (await import('drift-zoom')).default

      driftRef.current = new Drift(imageRef.current, {
        paneContainer: containerRef.current,
        inlinePane: 500,
        zoomFactor: zoomFactor,
        sourceAttribute: 'data-zoom',
        handleTouch: enableTouch,
        touchDelay: 100,
        hoverDelay: 0,
        containInline: true,
        showWhitespaceAtEdges: false,
        injectBaseStyles: true,
        onShow: () => {
          containerRef.current?.classList.add(styles.zooming)
          setShowHint(false)
        },
        onHide: () => {
          containerRef.current?.classList.remove(styles.zooming)
        },
      })
    } catch (error) {
      console.warn('Failed to initialize Drift magnifier:', error)
    }
  }, [isMobile, zoomFactor, enableTouch])

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  // Handle image error
  const handleImageError = useCallback(() => {
    if (onError) {
      onError()
    }
  }, [onError])

  // Initialize Drift after image loads and when mobile state changes
  useEffect(() => {
    if (isLoaded) {
      initDrift()
    }

    return () => {
      if (driftRef.current) {
        driftRef.current.destroy()
        driftRef.current = null
      }
    }
  }, [isLoaded, isMobile, initDrift])

  // Handle keyboard activation for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setShowHint((prev) => !prev)
    }
  }, [])

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Intentional keyboard interaction for a11y
    <div
      ref={containerRef}
      className={`${styles.container} ${isMobile ? styles.mobileContainer : ''} ${className}`.trim()}
      data-testid="glass-magnifier"
      role="img"
      aria-label={alt}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Needed for keyboard focus
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <img
        ref={imageRef}
        src={src}
        data-zoom={zoomSrc}
        alt={alt}
        className={styles.image}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {/* Zoom icon indicator - desktop only */}
      {!isMobile && (
        <div className={styles.zoomIndicator} aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
            <path d="M11 8v6M8 11h6" />
          </svg>
        </div>
      )}
      {/* Hover hint for desktop on first view */}
      {!isMobile && showHint && (
        <div
          className={`${styles.touchHint} ${styles.desktop}`}
          aria-live="polite"
        >
          <span>{t('hoverToZoom')}</span>
        </div>
      )}
    </div>
  )
}

export default GlassMagnifier
