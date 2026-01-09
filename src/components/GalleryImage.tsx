import React from 'react'
import { Link } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import type { Painting } from '../types'
import * as styles from './GalleryImage.module.css'

interface GalleryImageProps {
  painting: Painting
  image: IGatsbyImageData | null
}

const GalleryImage: React.FC<GalleryImageProps> = ({ painting, image }) => {
  const imageData = image ? getImage(image) : null

  return (
    <Link
      to={`/painting/${painting.id}`}
      className={styles.galleryItem}
      aria-label={`View ${painting.title}`}
    >
      <div className={styles.imageWrapper}>
        {imageData ? (
          <GatsbyImage
            image={imageData}
            alt={painting.alt}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder}>
            <span>{painting.title}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default GalleryImage
