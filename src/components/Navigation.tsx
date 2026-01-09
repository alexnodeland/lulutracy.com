import React, { useEffect } from 'react'
import { Link } from 'gatsby'
import type { NavigationProps } from '../types'
import * as styles from './Navigation.module.css'

const Navigation: React.FC<NavigationProps> = ({ isOpen, onClose }) => {
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
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        <ul className={styles.navList}>
          <li>
            <Link to="/about" className={styles.navLink} onClick={onClose}>
              about
            </Link>
          </li>
        </ul>
      </nav>
    </>
  )
}

export default Navigation
