import React, { useEffect, useRef, useCallback, useState } from 'react'
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
}

const GlassMagnifier: React.FC<GlassMagnifierProps> = ({
  src,
  zoomSrc,
  alt,
  className = '',
  zoomFactor = 2,
  enableTouch = true,
}) => {
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

  // Initialize Drift when image is loaded
  const initDrift = useCallback(async () => {
    if (!imageRef.current || !containerRef.current) return

    // Destroy existing instance first
    if (driftRef.current) {
      driftRef.current.destroy()
      driftRef.current = null
    }

    try {
      const Drift = (await import('drift-zoom')).default

      driftRef.current = new Drift(imageRef.current, {
        paneContainer: containerRef.current,
        inlinePane: isMobile ? true : 500,
        zoomFactor: isMobile ? zoomFactor * 0.75 : zoomFactor,
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
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setShowHint((prev) => !prev)
      }
    },
    []
  )

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`.trim()}
      data-testid="glass-magnifier"
      role="group"
      aria-label={`Zoomable image: ${alt}. ${isMobile ? 'Tap and hold' : 'Hover'} to zoom.`}
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
      />
      {/* Zoom icon indicator */}
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
      {/* Touch hint for mobile / Hover hint for desktop on first view */}
      {showHint && (
        <div
          className={`${styles.touchHint} ${isMobile ? styles.mobile : styles.desktop}`}
          aria-live="polite"
        >
          <span>{isMobile ? 'Tap and hold to zoom' : 'Hover to zoom'}</span>
        </div>
      )}
    </div>
  )
}

export default GlassMagnifier
