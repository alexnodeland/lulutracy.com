import React from 'react'
import { useI18next } from 'gatsby-plugin-react-i18next'
import * as styles from './LanguageSwitcher.module.css'

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'EN',
  zh: '中文',
}

const LanguageSwitcher: React.FC = () => {
  const { languages, language, changeLanguage } = useI18next()

  const handleChange = (newLang: string) => {
    changeLanguage(newLang)
  }

  return (
    <div
      className={styles.switcher}
      role="navigation"
      aria-label="Language selection"
    >
      {languages.map((lng) => (
        <button
          key={lng}
          onClick={() => handleChange(lng)}
          className={`${styles.button} ${lng === language ? styles.active : ''}`}
          aria-current={lng === language ? 'true' : undefined}
          lang={lng}
          type="button"
        >
          {LANGUAGE_NAMES[lng] || lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
