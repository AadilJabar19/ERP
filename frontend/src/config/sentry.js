import * as Sentry from '@sentry/react';

export const initSentry = () => {
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.REACT_APP_ENVIRONMENT || 'development',
      integrations: [
        Sentry.browserTracingIntegration({
          // Set sampling rate for performance monitoring
          tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
        }),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Filter out specific errors
      beforeSend(event, hint) {
        // Don't send errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Sentry Error:', hint.originalException || hint.syntheticException);
          return null;
        }
        
        // Filter out network errors that are expected
        const error = hint.originalException;
        if (error && error.message && error.message.includes('Network Error')) {
          return null;
        }
        
        return event;
      },
    });
  }
};

// Custom error boundary component
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Manual error capture
export const captureError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Set user context
export const setUserContext = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      role: user.role,
    });
  } else {
    Sentry.setUser(null);
  }
};

// Add breadcrumb for tracking user actions
export const addBreadcrumb = (message, category = 'user-action', level = 'info') => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
};
