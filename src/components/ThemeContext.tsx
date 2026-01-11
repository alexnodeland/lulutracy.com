import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react'
import type { Theme, ThemeContextValue } from '../types'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'theme'

const getInitialTheme = (): Theme => {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return 'light'
  }

  // Check localStorage first
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  // Fall back to system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Use lazy initializer to get theme on first render
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const isInitialMount = useRef(true)

  // Update document attribute and localStorage when theme changes
  useEffect(() => {
    // Skip localStorage write on initial mount (to avoid overwriting during SSR hydration)
    if (isInitialMount.current) {
      isInitialMount.current = false
      // Still set the document attribute on initial mount
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme)
      }
      return
    }

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }, [theme])

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
