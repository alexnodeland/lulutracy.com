import React from 'react'
import { GatsbySSR } from 'gatsby'

export const onRenderBody: GatsbySSR['onRenderBody'] = ({
  setHeadComponents,
}) => {
  setHeadComponents([
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
