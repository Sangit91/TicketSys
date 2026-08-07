import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[TicketSys] UI rendering error:', error, info);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-4 p-12 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-neon-red/15 border border-neon-red/40 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-neon-red" />
          </div>
          <div>
            <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-white">
              Đã Xảy Ra Lỗi Hiển Thị
            </h2>
            <p className="font-sans text-xs text-white/60 mt-1">
              Có lỗi không mong muốn khi tải nội dung. Vui lòng thử tải lại.
            </p>
          </div>
          <button
            onClick={this.reset}
            className="inline-flex items-center gap-2 bg-acid-lime hover:bg-acid-lime-dim text-black font-bold text-xs px-4 py-2 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Tải Lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}