import React from 'react'
import { Link } from 'gatsby'
import { StaticImage } from 'gatsby-plugin-image'
import type { HeaderProps } from '../types'
import * as styles from './Header.module.css'

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label="Lulu Tracy - Home">
          <StaticImage
            src="../images/logo.png"
            alt="Lulu Tracy"
            className={styles.logoImage}
            placeholder="none"
            layout="fixed"
            height={40}
            loading="eager"
          />
        </Link>
        <button
          className={styles.menuButton}
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
          type="button"
        >
          <span className={styles.hamburger}>
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
