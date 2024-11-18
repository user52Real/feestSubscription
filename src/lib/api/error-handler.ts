import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export interface ApiError extends Error {
  code?: string;
  statusCode?: number;
  data?: any;
}

export class ApiError extends Error {
  constructor(message: string, statusCode: number = 500, code?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.data = data;
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  // Log to Sentry
  Sentry.captureException(error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          data: error.data,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        message: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    },
    { status: 500 }
  );
}