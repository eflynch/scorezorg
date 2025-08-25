# � SIMPLE DEPLOYMENT GUIDE

## Three Ways to Run Scorezorg

### 1. Local Development (nx directly)
```bash
nx dev scorezorg
```
- Uses: `apps/scorezorg/.env.local`
- Database: Your local PostgreSQL
- Hot reloading, fast development

### 2. Test Docker Image Locally
```bash
docker-compose up
```
- Uses: `apps/scorezorg/.env.production` + `.env` (Docker Compose)
- Database: PostgreSQL container
- Tests the same setup as production

### 3. Production Deployment
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```
- Uses: `apps/scorezorg/.env.production` + production overrides
- Database: Managed service recommended
- SSL enabled, resource limits

## Environment Files (Simplified)

```
.env                           # Docker Compose variables
apps/scorezorg/
  ├── .env.local              # Local development only
  ├── .env.production         # Docker (testing + production)
  └── .env.example            # Documentation
```

That's it! No more confusion. 🎯
