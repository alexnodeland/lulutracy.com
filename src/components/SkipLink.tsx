import React from 'react'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import * as styles from './SkipLink.module.css'

interface SkipLinkProps {
  targetId?: string
}

const SkipLink: React.FC<SkipLinkProps> = ({ targetId = 'main-content' }) => {
  const { t } = useTranslation('common')

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <a href={`#${targetId}`} className={styles.skipLink} onClick={handleClick}>
      {t('skipToContent', 'Skip to main content')}
    </a>
  )
}

export default SkipLink
