import React, { useEffect, useRef, useCallback } from 'react'
import { Link as I18nLink, useTranslation } from 'gatsby-plugin-react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
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
  const navRef = useRef<HTMLElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  // Get all focusable elements within the nav
  const getFocusableElements = useCallback(() => {
    if (!navRef.current) return []
    return Array.from(
      navRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    )
  }, [])

  // Handle escape key and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap - handle Tab key
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements()
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          // Shift + Tab: if on first element, go to last
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab: if on last element, go to first
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, getFocusableElements])

  // Focus management - focus first element when opened, restore focus when closed
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElementRef.current = document.activeElement as HTMLElement
      // Focus first focusable element after a short delay for animation
      const timer = setTimeout(() => {
        const focusableElements = getFocusableElements()
        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    } else {
      // Restore focus to previously focused element
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus()
        previousActiveElementRef.current = null
      }
    }
  }, [isOpen, getFocusableElements])

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
        ref={navRef}
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
        <div className={styles.settingsSection}>
          <div className={styles.settingsRow}>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navigation
