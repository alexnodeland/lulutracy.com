import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import type { Painting } from '../types'
import SkeletonLoader from './SkeletonLoader'
import * as styles from './GalleryImage.module.css'

interface GalleryImageProps {
  painting: Painting
  image: IGatsbyImageData | null
  /** Index for staggered animation delay */
  index?: number
}

const GalleryImage: React.FC<GalleryImageProps> = ({
  painting,
  image,
  index = 0,
}) => {
  const imageData = image ? getImage(image) : null
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for staggered reveal animation
  useEffect(() => {
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
  }, [index])

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
              loading="lazy"
              onLoad={handleImageLoad}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>{painting.title}</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className={styles.overlay} aria-hidden="true">
            <span className={styles.viewText}>View</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default GalleryImage
