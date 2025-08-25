# ScoreZorg Deployment Guide

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Domain name (for production)
- SSL certificate (for HTTPS)

## Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Local Development
```bash
# Clone and set up for local development
git clone <your-repo>
cd scorezorg

# Set up local environment (SSL disabled)
cp .env.template .env
# Edit .env: set DB_PASSWORD and SSL_MODE=disable

# Start local development environment
docker-compose up --build
# Application: http://localhost:3000
# Database: localhost:5433
```

#### Production Deployment
```bash
# Production deployment with SSL enabled
git clone <your-repo>
cd scorezorg

# Set up production environment
cp .env.template .env.prod
# Edit .env.prod: set DB_PASSWORD and SSL_MODE=require

# Deploy with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# For external database (recommended for production)
export DATABASE_URL="postgresql://user:pass@managed-db.provider.com:5432/db?sslmode=require"
docker-compose up -d app
```

#### Production Considerations
- **Managed Database**: Consider using AWS RDS, Google Cloud SQL, or similar instead of self-hosted PostgreSQL
- **SSL Certificates**: The production setup assumes SSL certificates are properly configured
- **Reverse Proxy**: Use nginx, Traefik, or cloud load balancer for HTTPS termination
- **Secrets**: Use Docker secrets or environment variable injection for sensitive data
   # Edit .env with your database password
   
   # Set up application environment  
   cp apps/scorezorg/.env.production.template apps/scorezorg/.env.production
   # Edit .env.production with your production values
   ```

2. **Set environment variables:**
   ```bash
   # Option 1: Edit the .env file directly
   # Option 2: Set in shell (overrides .env file)
   export DB_PASSWORD=your_secure_password
   ```

3. **Deploy with Docker Compose:**
   ```bash
   npm run docker:run
   ```

### Option 2: Manual Deployment

1. **Database Setup:**
   ```bash
   createdb scorezorg
   psql scorezorg < apps/scorezorg/database/production-schema.sql
   ```

2. **Application:**
   ```bash
   npm install
   npm run deploy:build
   npm start
   ```

### Option 3: Platform Deployment

#### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### Railway/Render/DigitalOcean
1. Connect repository
2. Configure build command: `npm run deploy:build`
3. Configure start command: `npm start`
4. Set environment variables

### Option 3: DigitalOcean Docker Deployment

DigitalOcean offers several ways to deploy Docker containers:

#### Method A: DigitalOcean App Platform (Recommended)

1. **Prepare your repository:**
   ```bash
   # Make sure your Dockerfile is in the root directory (already done)
   # Ensure .env.production.template is configured
   ```

2. **Create a Managed Database:**
   - Go to DigitalOcean → Databases
   - Create a new PostgreSQL database
   - Note the connection details

3. **Deploy via App Platform:**
   - Go to DigitalOcean → Apps
   - Create new app from your GitHub repo
   - Configure build settings:
     - Build Command: `npm run build`
     - Source Directory: `/apps/scorezorg`
     - Dockerfile Path: `Dockerfile`
   
4. **Set Environment Variables:**
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://username:password@hostname:port/database
   # Add other variables from .env.production.template as needed
   ```

5. **Deploy:**
   - Click "Create Resources"
   - DigitalOcean will build and deploy automatically
   - Your app will be available at a generated URL

#### Method B: DigitalOcean Droplet with Docker

1. **Create a Droplet:**
   ```bash
   # Choose Docker marketplace image or install Docker manually
   # Recommended: 2GB RAM, Ubuntu with Docker
   ```

2. **SSH into your droplet:**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Deploy your app:**
   ```bash
   # Clone your repo
   git clone https://github.com/your-username/scorezorg.git
   cd scorezorg
   
   # Set up environment
   cp apps/scorezorg/.env.production.template apps/scorezorg/.env.production
   nano apps/scorezorg/.env.production  # Edit with your values
   
   # Build and run
   docker build -t scorezorg .
   docker run -d -p 80:3000 --env-file apps/scorezorg/.env.production scorezorg
   ```

4. **Set up database:**
   - Use DigitalOcean Managed Database (recommended)
   - Or install PostgreSQL on the same droplet:
   ```bash
   docker run -d --name postgres \
     -e POSTGRES_PASSWORD=your_password \
     -e POSTGRES_DB=scorezorg \
     -v postgres_data:/var/lib/postgresql/data \
     -p 5432:5432 \
     postgres:15
   ```

#### Method C: Docker Registry + Droplet

1. **Build and push to registry:**
   ```bash
   # Build locally
   docker build -t your-registry/scorezorg .
   
   # Push to DigitalOcean Container Registry or Docker Hub
   docker push your-registry/scorezorg
   ```

2. **Deploy on droplet:**
   ```bash
   docker pull your-registry/scorezorg
   docker run -d -p 80:3000 --env-file .env.production your-registry/scorezorg
   ```

**DigitalOcean Advantages:**
- ✅ Simple App Platform deployment
- ✅ Managed PostgreSQL databases
- ✅ Automatic SSL certificates
- ✅ Built-in monitoring and scaling
- ✅ Competitive pricing
- ✅ Great documentation

**Recommended Setup:**
- **App Platform** for the application (auto-scaling, SSL, easy deployment)
- **Managed Database** for PostgreSQL (backups, monitoring, security)
- **Spaces CDN** for static assets (if needed later)

## Environment Variables

Required for production:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure environment variables
- [ ] Configure proper CORS policies
- [ ] Set up database backups
- [ ] Monitor application logs
- [ ] Set up error tracking (Sentry)
- [ ] Configure rate limiting
- [ ] Review and test all API endpoints

## Monitoring

- Health check endpoint: `/api/health`
- Database connection status included
- Set up monitoring alerts for downtime

## Backup Strategy

1. **Database backups:**
   ```bash
   pg_dump scorezorg > backup_$(date +%Y%m%d).sql
   ```

2. **Automated backups** (set up cron job):
   ```bash
   0 2 * * * pg_dump scorezorg > /backups/scorezorg_$(date +\%Y\%m\%d).sql
   ```

## Scaling Considerations

- Database connection pooling is configured
- Consider read replicas for high traffic
- Use CDN for static assets
- Implement Redis for session storage (if adding auth)
- Monitor database performance

## Troubleshooting

- Check logs: `docker-compose logs app`
- Database connectivity: Visit `/api/health`
- Performance monitoring: Enable Next.js analytics
