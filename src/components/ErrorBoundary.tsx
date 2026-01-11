import React, { Component, ErrorInfo, ReactNode } from 'react'
import * as styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined })
  }

  handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={styles.container} role="alert">
          <div className={styles.content}>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.message}>
              We apologize for the inconvenience. Please try refreshing the page
              or return to the home page.
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                onClick={this.handleReset}
                className={styles.button}
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
