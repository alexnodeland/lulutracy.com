import React from 'react'
import type { GatsbyBrowser } from 'gatsby'
import { LocationProvider } from './src/components/LocationContext'
import { ThemeProvider } from './src/components/ThemeContext'

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
  element,
  props,
}) => {
  return (
    <ThemeProvider>
      <LocationProvider location={props.location}>{element}</LocationProvider>
    </ThemeProvider>
  )
}
