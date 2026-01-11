import React, { useEffect } from 'react'
import { Link as I18nLink, useTranslation } from 'gatsby-plugin-react-i18next'
import ThemeToggle from './ThemeToggle'
import type { NavigationProps } from '../types'
import * as styles from './Navigation.module.css'

// Workaround for gatsby-plugin-react-i18next Link type issues
const Link = I18nLink as unknown as React.FC<{
  to: string
  className?: string
  children: React.ReactNode
  onClick?: () => void
}>

const Navigation: React.FC<NavigationProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('common')

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Navigation Panel */}
      <nav
        className={`${styles.nav} ${isOpen ? styles.navOpen : ''}`}
        aria-label={t('mainNavigation')}
        aria-hidden={!isOpen}
      >
        <ul className={styles.navList}>
          <li>
            <Link to="/about" className={styles.navLink} onClick={onClose}>
              {t('nav.about')}
            </Link>
          </li>
        </ul>
        <div className={styles.themeToggleWrapper}>
          <ThemeToggle />
        </div>
      </nav>
    </>
  )
}

export default Navigation
