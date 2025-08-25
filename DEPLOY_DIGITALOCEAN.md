# 🚀 Deploy Scorezorg to DigitalOcean VPS

## Prerequisites
- DigitalOcean account
- SSH key generated (optional but recommended)

## Step 1: Create DigitalOcean Droplet

1. **Go to DigitalOcean**: https://cloud.digitalocean.com/droplets
2. **Click "Create Droplet"**
3. **Configure Droplet**:
   - **Image**: Ubuntu 24.04 LTS
   - **Plan**: Basic
   - **CPU Options**: Regular Intel ($6/month - 1GB RAM, 1 vCPU, 25GB SSD)
   - **Choose Region**: Select closest to your users
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: `scorezorg-server`
4. **Click "Create Droplet"**

## Step 2: Connect to Your Droplet

```bash
# SSH into your droplet (replace YOUR_DROPLET_IP with actual IP)
ssh root@YOUR_DROPLET_IP
```

## Step 3: Install Docker & Dependencies

```bash
# Update system packages
apt update && apt upgrade -y

# Install required packages
apt install -y curl git ufw

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
apt install -y docker-compose-plugin

# Verify installations
docker --version
docker compose version
```

## Step 4: Upload Your Code

### Option A: Git Clone (Recommended)
```bash
# Clone your repo
git clone https://github.com/eflynch/scorezorg.git
cd scorezorg
```

### Option B: Direct Upload
```bash
# On your LOCAL machine, upload files to droplet
scp -r /Users/eflynch/repos/scorezorg root@YOUR_DROPLET_IP:/root/scorezorg
```

## Step 5: Configure Environment

```bash
# Create production environment file
cat > .env << 'EOF'
# Secure production password - CHANGE THIS!
DB_PASSWORD=your_secure_password_here_123!
SSL_MODE=require
EOF

# Make sure permissions are secure
chmod 600 .env
```

## Step 6: Deploy Application

```bash
# Build and start services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## Step 7: Configure Firewall

```bash
# Set up UFW firewall
ufw allow OpenSSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS (for future SSL)
ufw --force enable

# Check firewall status
ufw status
```

## Step 8: Install Nginx Reverse Proxy

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
cat > /etc/nginx/sites-available/scorezorg << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;  # Replace with your domain or IP

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/scorezorg /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start and enable Nginx
systemctl restart nginx
systemctl enable nginx
```

## Step 9: Test Your Deployment

```bash
# Test health endpoint
curl http://YOUR_DROPLET_IP/api/health

# Should return: {"status":"healthy","timestamp":"...","database":"connected"}
```

## Step 10: Set Up Auto-Start (Optional)

```bash
# Create systemd service for auto-restart
cat > /etc/systemd/system/scorezorg.service << 'EOF'
[Unit]
Description=Scorezorg Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/root/scorezorg
ExecStart=/usr/bin/docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.yml -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
systemctl enable scorezorg.service
systemctl start scorezorg.service
```

## Maintenance Commands

```bash
# View logs
docker compose logs -f

# Restart application
docker compose restart app

# Update application (after code changes)
git pull
docker compose build --no-cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Backup database
docker compose exec postgres pg_dump -U scorezorg scorezorg > backup.sql
```

## Costs Summary
- **Basic Droplet**: $6/month
- **Total**: $6/month

## Access Your App
- **HTTP**: http://YOUR_DROPLET_IP
- **To add SSL**: Use Certbot with Let's Encrypt (free SSL certificates)

Your Scorezorg app is now live! 🎉
