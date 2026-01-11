import React from 'react'
import type { ThemeContextValue } from '../src/types'

const mockThemeContext: ThemeContextValue = {
  theme: 'light',
  toggleTheme: jest.fn(),
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>
}

export const useTheme = (): ThemeContextValue => {
  return mockThemeContext
}

export default {}
