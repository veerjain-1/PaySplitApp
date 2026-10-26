/**
 * Lightweight in-memory rate limiter middleware with zero external dependencies.
 * Tracks requests per IP within a sliding time window.
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;
  const hits = new Map();

  // Periodic cleanup of expired IPs every 5 minutes
  const cleanupInterval = global.setInterval(
    () => {
      const now = Date.now();
      for (const [ip, record] of hits.entries()) {
        if (now > record.resetTime) {
          hits.delete(ip);
        }
      }
    },
    5 * 60 * 1000
  );
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  const limiter = (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = hits.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    record.count += 1;
    hits.set(ip, record);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));

    if (record.count > max) {
      return res.status(429).json({
        error: options.message || 'Too many requests, please try again later.',
      });
    }

    next();
  };

  limiter.reset = () => hits.clear();
  return limiter;
}

module.exports = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
