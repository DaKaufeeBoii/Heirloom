import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';

dotenv.config();

const dsn = process.env.SENTRY_DSN || 'https://1cac9bf459614b16079f9ffda215e811@o4512202123116544.ingest.us.sentry.io/4512202177118208';

Sentry.init({
  dsn,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development',
});

console.log('[Sentry] Initialized with tracesSampleRate: 1.0');
