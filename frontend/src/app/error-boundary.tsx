import React from 'react'
import { ErrorPage } from '../pages/common/error'

type AppErrorBoundaryProps = {
  children: React.ReactNode
}

type AppErrorBoundaryState = {
  error: unknown
  hasError: boolean
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null,
    hasError: false,
  }

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return {
      error,
      hasError: true,
    }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('Unhandled frontend error:', error)
    console.error(info.componentStack)
  }

  handleReset = () => {
    this.setState({
      error: null,
      hasError: false,
    })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage error={this.state.error} reset={this.handleReset} />
    }

    return this.props.children
  }
}
