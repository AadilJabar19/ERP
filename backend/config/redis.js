const Redis = require('ioredis');

let redisClient = null;

const initRedis = () => {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      console.log('✓ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redisClient.on('ready', () => {
      console.log('✓ Redis is ready to use');
    });
  }

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
};

// Cache middleware for Express routes
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const client = getRedisClient();
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await client.get(key);
      
      if (cachedData) {
        console.log(`Cache hit: ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json
      res.json = (data) => {
        // Cache the response
        client.setex(key, duration, JSON.stringify(data))
          .catch(err => console.error('Cache set error:', err));
        
        // Send response
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Clear cache by pattern
const clearCache = async (pattern = '*') => {
  const client = getRedisClient();
  
  try {
    const keys = await client.keys(`cache:${pattern}`);
    
    if (keys.length > 0) {
      await client.del(...keys);
      console.log(`Cleared ${keys.length} cache entries`);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};

// Clear specific cache key
const clearCacheKey = async (key) => {
  const client = getRedisClient();
  
  try {
    await client.del(`cache:${key}`);
    console.log(`Cleared cache key: ${key}`);
  } catch (error) {
    console.error('Clear cache key error:', error);
  }
};

// Get cached data
const getCached = async (key) => {
  const client = getRedisClient();
  
  try {
    const data = await client.get(`cache:${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Get cached error:', error);
    return null;
  }
};

// Set cached data
const setCached = async (key, data, duration = 300) => {
  const client = getRedisClient();
  
  try {
    await client.setex(`cache:${key}`, duration, JSON.stringify(data));
  } catch (error) {
    console.error('Set cached error:', error);
  }
};

// Session storage
const setSession = async (sessionId, data, duration = 86400) => {
  const client = getRedisClient();
  
  try {
    await client.setex(`session:${sessionId}`, duration, JSON.stringify(data));
  } catch (error) {
    console.error('Set session error:', error);
  }
};

const getSession = async (sessionId) => {
  const client = getRedisClient();
  
  try {
    const data = await client.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

const deleteSession = async (sessionId) => {
  const client = getRedisClient();
  
  try {
    await client.del(`session:${sessionId}`);
  } catch (error) {
    console.error('Delete session error:', error);
  }
};

// Rate limiting with Redis
const checkRateLimit = async (identifier, limit = 100, window = 60) => {
  const client = getRedisClient();
  const key = `ratelimit:${identifier}`;
  
  try {
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, window);
    }
    
    return {
      allowed: current <= limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, current: 0, limit, remaining: limit };
  }
};

module.exports = {
  initRedis,
  getRedisClient,
  cacheMiddleware,
  clearCache,
  clearCacheKey,
  getCached,
  setCached,
  setSession,
  getSession,
  deleteSession,
  checkRateLimit,
};
