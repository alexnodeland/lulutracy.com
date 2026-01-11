const React = require('react')

// Mock translations that match the real translation files
const mockTranslations = {
  common: {
    copyright: 'Copyright {{year}} lulutracy. All rights reserved.',
    'nav.about': 'about',
    'nav.home': 'Lulu Tracy - Home',
    toggleMenu: 'Toggle navigation menu',
    mainNavigation: 'Main navigation',
  },
  404: {
    title: 'Page Not Found',
    message: "The page you're looking for doesn't exist.",
    returnLink: 'Return to Gallery',
  },
  painting: {
    category: 'PAINTING',
    artworkSize: 'Artwork Size',
    size: 'Size',
    medium: 'Medium',
    on: 'on',
    imageNotAvailable: 'Image not available',
  },
  about: {
    contact: 'Contact',
    photoNotAvailable: 'Photo not available',
  },
  gallery: {
    viewPainting: 'View {{title}}',
  },
}

const useTranslation = (ns) => ({
  t: (key, options) => {
    const namespace = mockTranslations[ns] || {}
    let translation = namespace[key] || key

    if (options && typeof options === 'object') {
      Object.entries(options).forEach(([k, v]) => {
        translation = translation.replace(`{{${k}}}`, v)
      })
    }
    return translation
  },
  i18n: {
    language: 'en',
    changeLanguage: jest.fn().mockResolvedValue(undefined),
  },
})

const useI18next = () => ({
  language: 'en',
  languages: ['en', 'zh'],
  originalPath: '/',
  defaultLanguage: 'en',
  routed: false,
  changeLanguage: jest.fn().mockResolvedValue(undefined),
  t: (key) => key,
})

const Link = React.forwardRef(({ to, language, children, ...props }, ref) => {
  const href = language && language !== 'en' ? `/${language}${to}` : to
  return React.createElement('a', { href, ref, ...props }, children)
})
Link.displayName = 'Link'

const Trans = ({ children }) => children

const I18nextContext = React.createContext({
  language: 'en',
  languages: ['en', 'zh'],
  defaultLanguage: 'en',
  originalPath: '/',
  routed: false,
})

module.exports = {
  useTranslation,
  useI18next,
  Link,
  Trans,
  I18nextContext,
}
