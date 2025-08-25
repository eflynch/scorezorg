#!/bin/bash

# 🚀 Scorezorg DigitalOcean VPS Deployment Script
# This script automates the entire deployment process

set -e  # Exit on any error

# Function to handle errors
handle_error() {
    print_error "❌ Deployment failed at line $1"
    print_error "You can safely re-run this script to continue from where it left off"
    exit 1
}

# Set up error trap
trap 'handle_error $LINENO' ERR

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

print_status "🚀 Starting Scorezorg deployment on DigitalOcean VPS..."
print_status "💡 This script is safe to run multiple times if it fails partway through"

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || curl -s icanhazip.com)
print_status "🌍 Detected server IP: $SERVER_IP"

# Ask for domain (optional)
echo ""
echo -e "${YELLOW}CORS Configuration:${NC}"
echo "For security, we'll configure CORS to only allow requests from your domain/IP."
echo ""
read -p "Enter your domain name (e.g., yourdomain.com) or press Enter to use IP only: " DOMAIN_NAME

# Build allowed origins list
ALLOWED_ORIGINS="http://$SERVER_IP"
if [ ! -z "$DOMAIN_NAME" ]; then
    # Remove protocol if user included it
    DOMAIN_NAME=$(echo "$DOMAIN_NAME" | sed 's|^https\?://||')
    ALLOWED_ORIGINS="$ALLOWED_ORIGINS,https://$DOMAIN_NAME,http://$DOMAIN_NAME"
    print_status "🔒 CORS will allow: IP ($SERVER_IP) and domain ($DOMAIN_NAME)"
else
    print_status "🔒 CORS will allow: IP ($SERVER_IP) only"
fi

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Update system
print_status "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "📦 Installing required packages..."
apt install -y curl git ufw nginx

# Install Docker
if ! command_exists docker; then
    print_status "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    print_success "Docker installed successfully"
else
    print_warning "Docker is already installed"
fi

# Install Docker Compose
if ! command_exists "docker compose"; then
    print_status "🐳 Installing Docker Compose..."
    apt install -y docker-compose-plugin
    print_success "Docker Compose installed successfully"
else
    print_warning "Docker Compose is already installed"
fi

# Configure firewall
print_status "🔒 Configuring firewall..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_success "Firewall configured"

# Clone or update repository
REPO_DIR="/root/scorezorg"
if [ -d "$REPO_DIR" ]; then
    print_status "📡 Updating existing repository..."
    cd "$REPO_DIR"
    git pull
else
    print_status "📡 Cloning repository..."
    git clone https://github.com/eflynch/scorezorg.git "$REPO_DIR"
    cd "$REPO_DIR"
fi

# Generate secure database password
DB_PASSWORD=$(generate_password)
print_status "🔐 Generating secure database password..."

# Create environment file
print_status "⚙️ Creating production environment configuration..."
cat > .env << EOF
# Production environment variables
DB_PASSWORD=$DB_PASSWORD
SSL_MODE=require
ALLOWED_ORIGINS=$ALLOWED_ORIGINS
EOF

print_status "🔒 CORS configured for: $ALLOWED_ORIGINS"

chmod 600 .env
print_success "Environment file created with secure password"

# Stop existing containers if running
if docker compose ps >/dev/null 2>&1 && docker compose ps | grep -q "Up"; then
    print_status "🛑 Stopping existing containers..."
    docker compose down
fi

# Build and start services
print_status "🏗️ Building and starting services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
print_status "⏳ Waiting for services to start..."
sleep 30

# Check if services are healthy
if docker compose ps | grep -q "healthy\|Up"; then
    print_success "Services are running"
else
    print_error "Services failed to start properly"
    docker compose logs
    exit 1
fi

# Configure Nginx
print_status "🌐 Configuring Nginx reverse proxy..."

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

cat > /etc/nginx/sites-available/scorezorg << EOF
server {
    listen 80;
    server_name $SERVER_IP;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/api/health;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/scorezorg /etc/nginx/sites-enabled/
# Remove default site (ignore errors if already removed)
rm -f /etc/nginx/sites-enabled/default || true

# Test and restart Nginx
if nginx -t; then
    systemctl restart nginx
    systemctl enable nginx
    print_success "Nginx configured and started"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Create systemd service for auto-start
print_status "🔄 Creating auto-start service..."
# Stop service if it's running
systemctl stop scorezorg.service >/dev/null 2>&1 || true
# Disable service if it exists
systemctl disable scorezorg.service >/dev/null 2>&1 || true

cat > /etc/systemd/system/scorezorg.service << EOF
[Unit]
Description=Scorezorg Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$REPO_DIR
ExecStart=/usr/bin/docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.yml -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable scorezorg.service
print_success "Auto-start service created"

# Test the deployment
print_status "🧪 Testing deployment..."
sleep 5

if curl -s "http://localhost:3000/api/health" | grep -q "healthy"; then
    print_success "Health check passed!"
else
    print_error "Health check failed"
    docker compose logs app
    exit 1
fi

# Final success message
echo ""
echo "🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉"
echo ""
print_success "✅ Scorezorg successfully deployed!"
echo ""
echo -e "${GREEN}🌐 Your app is now live at: ${BLUE}http://$SERVER_IP${NC}"
if [ ! -z "$DOMAIN_NAME" ]; then
    echo -e "${GREEN}🌐 Also available at: ${BLUE}https://$DOMAIN_NAME${NC} (after SSL setup)"
fi
echo -e "${GREEN}🔍 Health check: ${BLUE}http://$SERVER_IP/api/health${NC}"
echo ""
echo -e "${YELLOW}🔒 CORS Security:${NC}"
echo -e "${GREEN}  • Allowed origins: ${BLUE}$ALLOWED_ORIGINS${NC}"
echo -e "${GREEN}  • Only these domains/IPs can access your API${NC}"
echo ""
echo -e "${YELLOW}📊 Useful commands:${NC}"
echo -e "  • View logs: ${BLUE}docker compose logs -f${NC}"
echo -e "  • Restart app: ${BLUE}docker compose restart app${NC}"
echo -e "  • Update app: ${BLUE}cd $REPO_DIR && git pull && docker compose up -d --build${NC}"
echo -e "  • Re-run deployment: ${BLUE}curl -fsSL https://raw.githubusercontent.com/eflynch/scorezorg/main/deploy.sh | bash${NC}"
echo ""
echo -e "${GREEN}🔐 Database password saved in: ${BLUE}$REPO_DIR/.env${NC}"
echo ""
echo "🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉"
