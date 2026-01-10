import React, { createContext, useContext } from 'react'

interface LocationContextValue {
  pathname: string
}

const LocationContext = createContext<LocationContextValue>({ pathname: '/' })

export const LocationProvider: React.FC<{
  location: LocationContextValue
  children: React.ReactNode
}> = ({ location, children }) => {
  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = (): LocationContextValue => {
  return useContext(LocationContext)
}
