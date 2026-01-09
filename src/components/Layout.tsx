import React, { useState } from 'react'
import Header from './Header'
import Navigation from './Navigation'
import Footer from './Footer'
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
      <Header onMenuToggle={toggleMenu} />
      <Navigation isOpen={isMenuOpen} onClose={closeMenu} />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
