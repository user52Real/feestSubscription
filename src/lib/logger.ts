// src/lib/logger.ts
import * as Sentry from '@sentry/nextjs';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  message: string;
  [key: string]: any;
}

class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private log(level: LogLevel, data: LogData) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      context: this.context,
      ...data,
    };

    // Console logging
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${
      this.context ? `[${this.context}] ` : ''
    }${data.message}`;

    switch (level) {
      case 'error':
        console.error(logMessage, data);
        Sentry.captureException(data.error || new Error(data.message), {
          extra: data,
        });
        break;
      case 'warn':
        console.warn(logMessage, data);
        Sentry.captureMessage(data.message, {
          level: 'warning',
          extra: data,
        });
        break;
      case 'info':
        console.info(logMessage, data);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(logMessage, data);
        }
        break;
    }
  }

  info(message: string, data: Record<string, any> = {}) {
    this.log('info', { message, ...data });
  }

  warn(message: string, data: Record<string, any> = {}) {
    this.log('warn', { message, ...data });
  }

  error(message: string, error?: Error, data: Record<string, any> = {}) {
    this.log('error', { message, error, ...data });
  }

  debug(message: string, data: Record<string, any> = {}) {
    this.log('debug', { message, ...data });
  }
}

export const logWebhookError = async (error: any, eventType: string) => {
  console.error(`Webhook Error (${eventType}):`, error);
  // Add your production logging service here (e.g., Sentry, LogRocket)
};

export const logger = new Logger();