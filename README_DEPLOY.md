# 🚀 Quick Deploy to DigitalOcean

## One-Command Deployment

Instead of following the long manual guide, you can now deploy Scorezorg with just **one command**!

### Step 1: Create DigitalOcean Droplet
1. Go to https://cloud.digitalocean.com/droplets
2. Create Ubuntu 24.04 LTS droplet ($6/month)
3. Note your droplet's IP address

### Step 2: Run the Deployment Script
```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/eflynch/scorezorg/main/deploy.sh | bash
```

That's it! 🎉

### What the Script Does Automatically:
- ✅ Updates system packages
- ✅ Installs Docker & Docker Compose
- ✅ Configures firewall (UFW)
- ✅ Clones your repository
- ✅ Generates secure database password
- ✅ Builds and starts all services
- ✅ Configures Nginx reverse proxy
- ✅ Sets up auto-restart service
- ✅ Tests the deployment
- ✅ Configures CORS for your specific domain/IP

### After Deployment:
- **Your app**: http://YOUR_DROPLET_IP
- **Health check**: http://YOUR_DROPLET_IP/api/health
- **Cost**: $6/month
- **CORS**: Restricted to your specified domains/IPs for security

### Update CORS Settings:
If you need to add more domains later:
```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP
cd /root/scorezorg

# Run the CORS update script
./update-cors.sh
```

### Useful Commands:
```bash
# View logs
docker compose logs -f

# Restart app
docker compose restart app

# Update app (after code changes)
cd /root/scorezorg
git pull
docker compose up -d --build
```

### For SSL (Optional):
```bash
# Install Certbot for free SSL certificates
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Manual Deployment
If you prefer the step-by-step approach, see [DEPLOY_DIGITALOCEAN.md](DEPLOY_DIGITALOCEAN.md)
