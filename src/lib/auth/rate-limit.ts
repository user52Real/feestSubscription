import { Redis } from 'ioredis';
import { NextResponse } from 'next/server';

const redis = new Redis(process.env.REDIS_URL || '');

interface RateLimitConfig {
  limit: number;
  window: number; // in seconds
}

const defaultConfig: RateLimitConfig = {
  limit: 100,
  window: 60
};

export async function rateLimit(
  ip: string,
  endpoint: string,
  config: RateLimitConfig = defaultConfig
) {
  const key = `rate-limit:${ip}:${endpoint}`;
  
  const requests = await redis.incr(key);
  
  if (requests === 1) {
    await redis.expire(key, config.window);
  }

  if (requests > config.limit) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': config.window.toString()
      }
    });
  }

  return null;
}