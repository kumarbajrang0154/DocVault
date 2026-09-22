'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
}

interface State {
  hasError: boolean;
}

export class ThreeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[3D ErrorBoundary] Caught WebGL/Three.js render failure:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const primary = this.props.primaryColor || '#6366f1';
      const secondary = this.props.secondaryColor || '#8b5cf6';
      const bg = this.props.backgroundColor || '#09090b';

      return (
        <div
          className="fixed inset-0 -z-10 pointer-events-none transition-all duration-700 opacity-60"
          style={{
            background: `radial-gradient(circle at 50% 35%, ${primary}30 0%, ${secondary}20 50%, ${bg} 100%)`,
          }}
        />
      );
    }

    return this.props.children;
  }
}
