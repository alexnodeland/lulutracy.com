import React from 'react'
import { Link as I18nLink, useTranslation } from 'gatsby-plugin-react-i18next'
import { StaticImage } from 'gatsby-plugin-image'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import type { HeaderProps } from '../types'
import * as styles from './Header.module.css'

// Workaround for gatsby-plugin-react-i18next Link type issues
const Link = I18nLink as unknown as React.FC<{
  to: string
  className?: string
  children: React.ReactNode
  'aria-label'?: string
  onClick?: () => void
}>

const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  isMenuOpen = false,
}) => {
  const { t } = useTranslation('common')

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label={t('nav.home')}>
          <StaticImage
            src="../images/logo.png"
            alt="Lulu Tracy"
            className={styles.logoImage}
            placeholder="none"
            layout="fixed"
            height={50}
            loading="eager"
          />
        </Link>
        <div className={styles.rightSection}>
          <nav className={styles.desktopNav} aria-label={t('mainNavigation')}>
            <Link to="/about" className={styles.desktopNavLink}>
              {t('nav.about')}
            </Link>
          </nav>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <button
          className={styles.menuButton}
          onClick={onMenuToggle}
          aria-label={t('toggleMenu')}
          type="button"
        >
          <span
            className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerOpen : ''}`}
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </span>
        </button>
      </div>
    </header>
  )
}

export default Header
