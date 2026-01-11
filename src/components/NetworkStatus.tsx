import React, { useState, useEffect } from 'react'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import * as styles from './NetworkStatus.module.css'

const NetworkStatus: React.FC = () => {
  // Use lazy initializer to get initial online state (SSR safe)
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true
    return navigator.onLine
  })
  const [showIndicator, setShowIndicator] = useState(false)
  const { t } = useTranslation('common')

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOnline(true)
      // Show "back online" message briefly
      setShowIndicator(true)
      setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Don't render if online and not showing indicator
  if (isOnline && !showIndicator) return null

  return (
    <div
      className={`${styles.indicator} ${isOnline ? styles.online : styles.offline}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.icon} aria-hidden="true">
        {isOnline ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
            <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0122.58 9" />
            <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
            <path d="M8.53 16.11a6 6 0 016.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        )}
      </span>
      <span className={styles.message}>
        {isOnline ? t('backOnline') : t('offline')}
      </span>
    </div>
  )
}

export default NetworkStatus
