import React from 'react'
import * as styles from './SkeletonLoader.module.css'

interface SkeletonLoaderProps {
  /** Width of the skeleton (CSS value) */
  width?: string
  /** Height of the skeleton (CSS value) */
  height?: string
  /** Aspect ratio (e.g., "1", "16/9", "4/3") */
  aspectRatio?: string
  /** Border radius (CSS value) */
  borderRadius?: string
  /** Additional CSS class */
  className?: string
  /** Accessible label for screen readers */
  ariaLabel?: string
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height,
  aspectRatio,
  borderRadius = '0',
  className = '',
  ariaLabel = 'Loading...',
}) => {
  const style: React.CSSProperties = {
    width,
    borderRadius,
    ...(height && { height }),
    ...(aspectRatio && { aspectRatio }),
  }

  return (
    <div
      className={`${styles.skeleton} ${className}`.trim()}
      style={style}
      role="progressbar"
      aria-label={ariaLabel}
      aria-busy="true"
    />
  )
}

export default SkeletonLoader
