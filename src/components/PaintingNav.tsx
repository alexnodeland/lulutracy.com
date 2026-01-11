import React, { useEffect, useCallback } from 'react'
import { Link as I18nLink, useTranslation } from 'gatsby-plugin-react-i18next'
import * as styles from './PaintingNav.module.css'

// Workaround for gatsby-plugin-react-i18next Link type issues
const Link = I18nLink as unknown as React.FC<{
  to: string
  className?: string
  children: React.ReactNode
  'aria-label'?: string
}>

interface PaintingNavItem {
  id: string
  title: string
}

interface PaintingNavProps {
  prevPainting: PaintingNavItem | null
  nextPainting: PaintingNavItem | null
  currentIndex: number
  totalCount: number
}

const PaintingNav: React.FC<PaintingNavProps> = ({
  prevPainting,
  nextPainting,
  currentIndex = 0,
  totalCount = 0,
}) => {
  const { t } = useTranslation('painting')

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle if no modifier keys and not in an input
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
        return

      if (e.key === 'ArrowLeft' && prevPainting) {
        e.preventDefault()
        window.location.href = `/painting/${prevPainting.id}`
      } else if (e.key === 'ArrowRight' && nextPainting) {
        e.preventDefault()
        window.location.href = `/painting/${nextPainting.id}`
      }
    },
    [prevPainting, nextPainting]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <nav className={styles.nav} aria-label={t('paintingNavigation')}>
      <div className={styles.navInner}>
        {/* Back to gallery link */}
        <Link
          to="/"
          className={styles.backLink}
          aria-label={t('backToGallery')}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>{t('backToGallery')}</span>
        </Link>

        {/* Pagination */}
        <div className={styles.pagination}>
          {prevPainting ? (
            <Link
              to={`/painting/${prevPainting.id}`}
              className={styles.navButton}
              aria-label={`${t('previous')}: ${prevPainting.title}`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className={styles.srOnly}>{t('previous')}</span>
            </Link>
          ) : (
            <span className={`${styles.navButton} ${styles.disabled}`}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </span>
          )}

          {totalCount > 0 && (
            <span className={styles.counter}>
              {currentIndex + 1} / {totalCount}
            </span>
          )}

          {nextPainting ? (
            <Link
              to={`/painting/${nextPainting.id}`}
              className={styles.navButton}
              aria-label={`${t('next')}: ${nextPainting.title}`}
            >
              <span className={styles.srOnly}>{t('next')}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ) : (
            <span className={`${styles.navButton} ${styles.disabled}`}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </nav>
  )
}

export default PaintingNav
