import { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Player } from './engine/Player';
import { Film } from './film/Film';
import { SCENES, VOICEOVER_END } from './film/scenes';
import './styles/broadsheet.css';
import './styles/app.css';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled app error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: '#f3f2f2',
            color: '#111111',
            fontFamily: 'system-ui, sans-serif',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>Something went wrong.</h1>
            <p style={{ marginTop: '0.75rem', maxWidth: '32rem', lineHeight: 1.5 }}>
              The app hit an unexpected error. Please refresh the page to try again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('App root element #root was not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <Player width={1920} height={1080} bg="#f3f2f2" scenes={SCENES} audioSrc={`${import.meta.env.BASE_URL}voiceover.mp3`} audioEnd={VOICEOVER_END}>
        <Film />
      </Player>
    </ErrorBoundary>
  </StrictMode>,
);
