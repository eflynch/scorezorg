# CORS Configuration

## Problem
When deploying Scorezorg to a domain or IP address, there were potential CORS (Cross-Origin Resource Sharing) issues that could prevent the frontend from communicating with the API routes.

## Solution
I've implemented a simple, environment-variable based CORS solution:

### 1. Environment Variable Configuration
The CORS origins are controlled by the `ALLOWED_ORIGINS` environment variable:

```bash
# Development (allows all origins)
ALLOWED_ORIGINS=*

# Production (restricted to specific domains/IPs)
ALLOWED_ORIGINS=http://1.2.3.4,https://yourdomain.com,http://yourdomain.com
```

### 2. Next.js Headers Configuration (`next.config.js`)
```javascript
// Get allowed origins from environment variable, fallback to '*' for dev
const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';

// CORS headers for API routes
{
  source: '/api/(.*)',
  headers: [
    {
      key: 'Access-Control-Allow-Origin',
      value: allowedOrigins
    },
    // ... other headers
  ]
}
```

### 3. Middleware for OPTIONS Requests (`src/middleware.ts`)
Handles preflight OPTIONS requests and validates origins:

```javascript
// Get allowed origins from environment variable
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
let allowedOrigins = ['*']; // Default for development

if (allowedOriginsEnv && allowedOriginsEnv !== '*') {
  allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim());
}

// Check if origin is allowed and reject unauthorized requests
const isAllowed = !origin || 
                 allowedOrigins.includes('*') || 
                 allowedOrigins.includes(origin);
```

## Deployment Integration

The deployment script (`deploy.sh`) automatically:

1. **Detects your server IP**
2. **Asks for your domain name** (optional)
3. **Sets ALLOWED_ORIGINS** environment variable
4. **Restricts CORS to only your specified origins**

Example CORS configurations set by deployment:
- IP only: `ALLOWED_ORIGINS=http://1.2.3.4`
- Domain only: `ALLOWED_ORIGINS=https://yourdomain.com,http://yourdomain.com`
- Both: `ALLOWED_ORIGINS=http://1.2.3.4,https://yourdomain.com,http://yourdomain.com`

## Updating CORS After Deployment

Use the included `update-cors.sh` script:

```bash
# On your server
cd /root/scorezorg
./update-cors.sh
```

This script will:
- Show current CORS settings
- Let you update allowed domains/IPs
- Restart the application with new settings

## What This Fixes

1. **Cross-Origin API Calls**: Frontend can call `/api/*` endpoints from any domain
2. **Preflight Requests**: Browsers can successfully complete OPTIONS requests
3. **Domain/IP Flexibility**: App works whether accessed via:
   - IP address: `http://1.2.3.4`
   - Domain: `https://yourdomain.com`
   - Localhost: `http://localhost:3000`

## Security Notes

- Current configuration allows all origins (`*`) for maximum compatibility
- In production, you might want to restrict origins to specific domains:
  ```javascript
  'Access-Control-Allow-Origin': 'https://yourdomain.com'
  ```
- The configuration includes proper headers for credentials and caching

## Testing CORS

You can test CORS by:

1. **Health Check**: `curl -H "Origin: https://example.com" http://your-domain/api/health`
2. **Browser Console**: Open browser dev tools and try API calls from different origins
3. **Preflight Test**: 
   ```bash
   curl -X OPTIONS -H "Origin: https://example.com" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        http://your-domain/api/league
   ```

The deployment is now CORS-ready! 🎉
