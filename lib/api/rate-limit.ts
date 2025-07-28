import { NextRequest } from "next/server";
import { ApiError } from "./error-handler";

interface RateLimitStore {
  requests: Map<string, number[]>;
}

const rateLimitStore: RateLimitStore = {
  requests: new Map(),
};

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
};

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const { windowMs, maxRequests } = { ...defaultConfig, ...config };

  return async function checkRateLimit(request: NextRequest) {
    // Get client identifier (IP address or user ID)
    const clientId = request.headers.get("x-forwarded-for") || 
                    request.headers.get("x-real-ip") || 
                    "anonymous";

    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this client
    let clientRequests = rateLimitStore.requests.get(clientId) || [];
    
    // Filter out old requests outside the window
    clientRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (clientRequests.length >= maxRequests) {
      throw new ApiError(
        `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`,
        429,
        "RATE_LIMIT_EXCEEDED"
      );
    }
    
    // Add current request timestamp
    clientRequests.push(now);
    rateLimitStore.requests.set(clientId, clientRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      cleanupOldEntries(windowMs);
    }
  };
}

function cleanupOldEntries(windowMs: number) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  for (const [clientId, requests] of Array.from(rateLimitStore.requests.entries())) {
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    if (validRequests.length === 0) {
      rateLimitStore.requests.delete(clientId);
    } else {
      rateLimitStore.requests.set(clientId, validRequests);
    }
  }
}