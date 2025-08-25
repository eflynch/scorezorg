# 🚀 DEPLOYMENT GUIDE

## Environment Files Summary

### Development (local)
```bash
npm run dev
# Uses: .env.local (overrides .env.development)
```

### Docker Testing (local)
```bash
docker-compose up
# Uses: .env.docker for app, .env for Docker Compose
```

### Production (managed hosting)
```bash
npm run build && npm start
# Uses: .env.production + platform environment variables
# DATABASE_URL comes from hosting platform (Vercel, Railway, etc.)
```

### Production (self-hosted Docker)
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
# Uses: .env.docker + production overrides
# Recommended: Use managed database service instead of container
```

## Key Changes Made ✅

1. **Renamed** `.env.production` → `.env.docker` (for Docker testing)
2. **Created** new `.env.production` (for real production)
3. **Updated** `docker-compose.yml` to use `.env.docker`
4. **Standardized** all files to use `DATABASE_URL` format
5. **Added** `.env.development` for development defaults

## Best Practices 📋

- **Never commit** `.env.local` to git (already in .gitignore)
- **Use DATABASE_URL** format consistently across environments
- **Let hosting platforms** manage production secrets
- **Keep `.env.docker`** for local Docker testing only
- **Use `.env.production`** for real production deployments
