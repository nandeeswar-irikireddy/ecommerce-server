import { Request, Response, NextFunction } from "express";

interface RateLimiterArgs {
  windowMs: number;
  max: number;
}

interface RateLimitEntry {
  count: number;
  startTime: number;
}

const rateLimitStore: Record<string, RateLimitEntry> = {};

export function rateLimiter({ windowMs, max }: RateLimiterArgs) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();

    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = {
        count: 1,
        startTime: now,
      };
      return next();
    }

    const timeElapsed = now - rateLimitStore[ip].startTime;

    if (timeElapsed > windowMs) {
      rateLimitStore[ip] = {
        count: 1,
        startTime: now,
      };
      return next();
    }

    rateLimitStore[ip].count += 1;

    if (rateLimitStore[ip].count > max) {
      res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
      return;
    }

    next();
  };
}