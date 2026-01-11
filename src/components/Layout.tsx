import React, { useState } from 'react'
import Header from './Header'
import Navigation from './Navigation'
import Footer from './Footer'
import PageTransition from './PageTransition'
import ErrorBoundary from './ErrorBoundary'
import SkipLink from './SkipLink'
import NetworkStatus from './NetworkStatus'
import type { LayoutProps } from '../types'
import '../styles/global.css'
import * as styles from './Layout.module.css'

const Layout: React.FC<LayoutProps> = ({ children, persistentNav }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <ErrorBoundary>
      <div className={styles.layout}>
        <SkipLink targetId="main-content" />
        <Header onMenuToggle={toggleMenu} isMenuOpen={isMenuOpen} />
        <Navigation isOpen={isMenuOpen} onClose={closeMenu} />
        <main id="main-content" className={styles.main} tabIndex={-1}>
          {persistentNav}
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <NetworkStatus />
      </div>
    </ErrorBoundary>
  )
}

export default Layout
