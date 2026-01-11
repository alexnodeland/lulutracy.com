import React, { useState, useRef, useEffect } from 'react'
import { useI18next } from 'gatsby-plugin-react-i18next'
import { skipNextTransition } from './PageTransition'
import * as styles from './LanguageSwitcher.module.css'

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'en',
  zh: '中文',
  yue: '粵語',
  ms: 'bm',
}

const LanguageSwitcher: React.FC = () => {
  const { languages, language, changeLanguage } = useI18next()
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleSelect = (newLang: string) => {
    skipNextTransition()
    changeLanguage(newLang)
    setIsOpen(false)
  }

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev)
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div
      className={styles.wrapper}
      ref={wrapperRef}
      role="navigation"
      aria-label="Language selection"
    >
      <button
        className={styles.trigger}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
      >
        <span lang={language}>{LANGUAGE_NAMES[language] || language}</span>
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </button>
      {isOpen && (
        <ul className={styles.dropdown} role="listbox">
          {languages.map((lng) => (
            <li key={lng} role="option" aria-selected={lng === language}>
              <button
                className={`${styles.option} ${lng === language ? styles.optionActive : ''}`}
                onClick={() => handleSelect(lng)}
                lang={lng}
                type="button"
              >
                {LANGUAGE_NAMES[lng] || lng.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LanguageSwitcher
