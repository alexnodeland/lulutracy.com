import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import type { Painting } from '../types'
import SkeletonLoader from './SkeletonLoader'
import * as styles from './GalleryImage.module.css'

// Check if we should skip animations (e.g., after language change)
// This reads from the same key that PageTransition uses, but doesn't clear it
// (PageTransition will clear it)
const shouldSkipAnimation = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem('pageTransition:skipNext') === 'true'
  } catch {
    return false
  }
}

interface GalleryImageProps {
  painting: Painting
  image: IGatsbyImageData | null
  /** Index for staggered animation delay */
  index?: number
  /** Load image eagerly (for above-fold images to improve LCP) */
  eager?: boolean
}

const GalleryImage: React.FC<GalleryImageProps> = ({
  painting,
  image,
  index = 0,
  eager = false,
}) => {
  const { t } = useTranslation('common')
  const imageData = image ? getImage(image) : null
  const [isLoaded, setIsLoaded] = useState(false)
  // Skip animation if this is a language change or eager-loaded (start visible immediately)
  const [skipAnimation] = useState(() => shouldSkipAnimation() || eager)
  const [isVisible, setIsVisible] = useState(skipAnimation)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for staggered reveal animation
  useEffect(() => {
    // Skip if already visible (language change scenario)
    if (skipAnimation) return

    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add staggered delay based on index
            const delay = Math.min(index * 100, 500) // Cap at 500ms
            setTimeout(() => setIsVisible(true), delay)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [index, skipAnimation])

  const handleImageLoad = () => {
    setIsLoaded(true)
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.galleryItem} ${isVisible ? styles.visible : ''}`}
    >
      <Link
        to={`/painting/${painting.id}`}
        className={styles.galleryLink}
        aria-label={`View ${painting.title}`}
      >
        <div className={styles.imageWrapper}>
          {/* Skeleton loader shown until image loads */}
          {!isLoaded && imageData && (
            <SkeletonLoader
              className={styles.skeleton}
              aspectRatio="9/8"
              ariaLabel={`Loading ${painting.title}`}
            />
          )}
          {imageData ? (
            <GatsbyImage
              image={imageData}
              alt={painting.alt}
              className={`${styles.image} ${isLoaded ? styles.imageLoaded : ''}`}
              loading={eager ? 'eager' : 'lazy'}
              onLoad={handleImageLoad}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>{painting.title}</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className={styles.overlay} aria-hidden="true">
            <span className={styles.viewText}>{t('gallery.view')}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default GalleryImage
