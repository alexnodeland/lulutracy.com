import React from 'react'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import * as styles from './Footer.module.css'

const Footer: React.FC = () => {
  const { t } = useTranslation('common')
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>
          {t('copyright', { year: currentYear })}
        </p>
      </div>
    </footer>
  )
}

export default Footer
