import React, { useState } from 'react'
import Header from './Header'
import Navigation from './Navigation'
import Footer from './Footer'
import PageTransition from './PageTransition'
import type { LayoutProps } from '../types'
import '../styles/global.css'
import * as styles from './Layout.module.css'

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <div className={styles.layout}>
      <Header onMenuToggle={toggleMenu} isMenuOpen={isMenuOpen} />
      <Navigation isOpen={isMenuOpen} onClose={closeMenu} />
      <main className={styles.main}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  )
}

export default Layout
