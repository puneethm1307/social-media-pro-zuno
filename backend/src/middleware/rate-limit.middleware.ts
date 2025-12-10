/**
 * Rate limiting middleware using Redis.
 * Example implementation - can be enhanced with @nestjs/throttler package.
 */

import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const key = `rate_limit:${req.ip}`;
    const limit = parseInt(process.env.RATE_LIMIT_MAX || '100');
    const ttl = parseInt(process.env.RATE_LIMIT_TTL || '60');

    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, ttl);
    }

    if (current > limit) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current));

    next();
  }
}

