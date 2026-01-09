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

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize Drift when image is loaded
  const initDrift = useCallback(async () => {
    if (!imageRef.current || !containerRef.current || driftRef.current) return

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

  // Initialize Drift after image loads and component mounts
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
  }, [isLoaded, initDrift])

  // Update Drift settings when mobile state changes
  useEffect(() => {
    if (driftRef.current) {
      driftRef.current.destroy()
      driftRef.current = null
      if (isLoaded) {
        initDrift()
      }
    }
  }, [isMobile, isLoaded, initDrift])

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`.trim()}
      data-testid="glass-magnifier"
    >
      <img
        ref={imageRef}
        src={src}
        data-zoom={zoomSrc}
        alt={alt}
        className={styles.image}
        onLoad={handleImageLoad}
      />
      {isMobile && enableTouch && (
        <div className={styles.touchHint}>
          <span>Tap and hold to zoom</span>
        </div>
      )}
    </div>
  )
}

export default GlassMagnifier
