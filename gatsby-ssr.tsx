import React from 'react'
import type { GatsbySSR } from 'gatsby'
import { LocationProvider } from './src/components/LocationContext'
import { ThemeProvider } from './src/components/ThemeContext'

// Inline script to set theme before paint (prevents flash)
const themeInitScript = `
(function() {
  var theme = localStorage.getItem('theme');
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
`

export const onRenderBody: GatsbySSR['onRenderBody'] = ({
  setHeadComponents,
  setHtmlAttributes,
}) => {
  setHtmlAttributes({ lang: 'en' })
  setHeadComponents([
    <script
      key="theme-init"
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />,
    <link
      key="google-fonts-preconnect"
      rel="preconnect"
      href="https://fonts.googleapis.com"
    />,
    <link
      key="google-fonts-preconnect-static"
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />,
    <link
      key="google-fonts-montserrat"
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap"
    />,
  ])
}

export const wrapPageElement: GatsbySSR['wrapPageElement'] = ({
  element,
  props,
}) => {
  return (
    <ThemeProvider>
      <LocationProvider location={props.location}>{element}</LocationProvider>
    </ThemeProvider>
  )
}
