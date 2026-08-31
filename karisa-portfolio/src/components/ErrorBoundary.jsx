import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error details
    this.setState({
      error,
      errorInfo
    });

    // In production, you would log to an error reporting service
    if (import.meta.env.PROD) {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-cloth-100 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            <div className="border-2 border-alarm bg-cloth-50 p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center border-2 border-alarm">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-10 w-10 text-alarm" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-3xl font-bold text-mark-900 text-center mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-mark-600 text-center mb-6">
                We apologize for the inconvenience. An unexpected error has occurred.
              </p>

              {/* Error Details (Development only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-cloth-100 border border-alarm">
                  <h3 className="text-sm font-semibold text-alarm mb-2">Error Details:</h3>
                  <pre className="text-xs text-mark-600 overflow-x-auto">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-mark-500 cursor-pointer hover:text-mark-600">
                        Stack Trace
                      </summary>
                      <pre className="text-xs text-mark-500 mt-2 overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-pindo text-cloth-50 font-semibold hover:opacity-90 transition-opacity"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-cloth-100 border-2 border-pindo text-pindo font-semibold hover:bg-cloth-200 transition-colors"
                >
                  Go to Homepage
                </button>
              </div>

              {/* Contact Info */}
              <p className="text-center text-mark-500 text-sm mt-6">
                If this problem persists, please{' '}
                <a 
                  href="#contact" 
                  className="text-pindo hover:underline"
                >
                  contact me
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
