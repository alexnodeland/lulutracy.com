import React from 'react'
import type { GatsbyBrowser } from 'gatsby'
import { LocationProvider } from './src/components/LocationContext'

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
  element,
  props,
}) => {
  return (
    <LocationProvider location={props.location}>{element}</LocationProvider>
  )
}
