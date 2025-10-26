import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log for diagnostics
    console.error('App runtime error:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16 }}>
          <div className="card" style={{ background: 'var(--card-bg)', borderLeft: '4px solid var(--color-danger, #e74c3c)' }}>
            <h2 style={{ marginTop: 0 }}>Es ist ein Fehler aufgetreten</h2>
            <p style={{ margin: '8px 0' }}>Bitte lade die Seite neu. Wenn der Fehler bleibt, melde ihn mit den folgenden Details.</p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', fontSize: 12 }}>
              {String(this.state.error?.message || this.state.error || 'Unbekannter Fehler')}
            </pre>
            {this.state.info && (
              <details>
                <summary>Stacktrace</summary>
                <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', fontSize: 12 }}>
                  {String(this.state.info?.componentStack || '')}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}