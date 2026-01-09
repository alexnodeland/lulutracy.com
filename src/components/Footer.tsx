import React from 'react'
import * as styles from './Footer.module.css'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>
          Copyright &copy; {currentYear} lulutracy. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
