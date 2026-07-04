'use client'
import React from 'react'

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-8 bg-red-500 text-white font-mono text-xs overflow-auto max-w-[100vw]">
        <h1 className="text-2xl font-bold mb-4">CRASH!</h1>
        <pre>{this.state.error.stack}</pre>
      </div>
    }
    return this.props.children
  }
}
