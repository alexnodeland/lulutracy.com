import React from 'react'
import { render, screen } from '@testing-library/react'
import { LocationProvider, useLocation } from '../LocationContext'

// Test component that uses the location context
const TestComponent: React.FC = () => {
  const { pathname } = useLocation()
  return <div data-testid="pathname">{pathname}</div>
}

describe('LocationContext', () => {
  describe('LocationProvider', () => {
    it('provides location to children', () => {
      render(
        <LocationProvider location={{ pathname: '/test-path' }}>
          <TestComponent />
        </LocationProvider>
      )

      expect(screen.getByTestId('pathname')).toHaveTextContent('/test-path')
    })

    it('provides different pathname values', () => {
      render(
        <LocationProvider location={{ pathname: '/painting/symbiosis' }}>
          <TestComponent />
        </LocationProvider>
      )

      expect(screen.getByTestId('pathname')).toHaveTextContent(
        '/painting/symbiosis'
      )
    })

    it('handles root path', () => {
      render(
        <LocationProvider location={{ pathname: '/' }}>
          <TestComponent />
        </LocationProvider>
      )

      expect(screen.getByTestId('pathname')).toHaveTextContent('/')
    })

    it('handles localized paths', () => {
      render(
        <LocationProvider location={{ pathname: '/zh/painting/test' }}>
          <TestComponent />
        </LocationProvider>
      )

      expect(screen.getByTestId('pathname')).toHaveTextContent(
        '/zh/painting/test'
      )
    })
  })

  describe('useLocation', () => {
    it('returns default pathname when used outside provider', () => {
      // When used without provider, it returns the default context value
      render(<TestComponent />)

      expect(screen.getByTestId('pathname')).toHaveTextContent('/')
    })

    it('returns provided pathname when used inside provider', () => {
      render(
        <LocationProvider location={{ pathname: '/about' }}>
          <TestComponent />
        </LocationProvider>
      )

      expect(screen.getByTestId('pathname')).toHaveTextContent('/about')
    })
  })

  describe('nested providers', () => {
    it('inner provider overrides outer provider', () => {
      render(
        <LocationProvider location={{ pathname: '/outer' }}>
          <LocationProvider location={{ pathname: '/inner' }}>
            <TestComponent />
          </LocationProvider>
        </LocationProvider>
      )

      expect(screen.getByTestId('pathname')).toHaveTextContent('/inner')
    })
  })
})
