const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

const initSentry = (app) => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        // Enable HTTP calls tracing
        Sentry.httpIntegration({ tracing: true }),
        // Enable Express.js middleware tracing
        Sentry.expressIntegration({ app }),
        // Enable profiling
        nodeProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Profiling
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Filter out sensitive data
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request && event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        
        // Don't send errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Sentry Error:', hint.originalException || hint.syntheticException);
          return null;
        }
        
        return event;
      },
    });
  }
};

// Request handler - must be the first middleware
const requestHandler = () => {
  return Sentry.Handlers.requestHandler();
};

// Tracing handler - must be after request handler
const tracingHandler = () => {
  return Sentry.Handlers.tracingHandler();
};

// Error handler - must be before any other error middleware
const errorHandler = () => {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors with status code >= 400
      return error.status >= 400;
    },
  });
};

// Manual error capture
const captureError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Set user context
const setUserContext = (user) => {
  if (user) {
    Sentry.setUser({
      id: user._id.toString(),
      email: user.email,
      username: user.name,
      role: user.role,
    });
  } else {
    Sentry.setUser(null);
  }
};

module.exports = {
  initSentry,
  requestHandler,
  tracingHandler,
  errorHandler,
  captureError,
  setUserContext,
};
