#!/bin/bash

# 🔒 Scorezorg CORS Configuration Update Script
# Use this script to update CORS settings for your deployed Scorezorg instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo ""
echo "🔒 Scorezorg CORS Configuration Update"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ] || [ ! -d "apps/scorezorg" ]; then
    print_error "Please run this script from the Scorezorg project root directory"
    exit 1
fi

# Get current server IP
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || curl -s icanhazip.com)
print_status "Current server IP: $SERVER_IP"

# Show current CORS configuration
if [ -f ".env" ] && grep -q "ALLOWED_ORIGINS" .env; then
    CURRENT_ORIGINS=$(grep "ALLOWED_ORIGINS" .env | cut -d'=' -f2)
    echo -e "${YELLOW}Current CORS settings:${NC} $CURRENT_ORIGINS"
else
    echo -e "${YELLOW}No CORS configuration found${NC}"
fi

echo ""
echo "Enter the domains/IPs you want to allow (comma-separated):"
echo "Examples:"
echo "  - IP only: $SERVER_IP"
echo "  - Domain only: yourdomain.com"
echo "  - Both: $SERVER_IP,yourdomain.com"
echo "  - Multiple: $SERVER_IP,yourdomain.com,subdomain.yourdomain.com"
echo ""

read -p "Allowed origins: " NEW_ORIGINS

# Validate input
if [ -z "$NEW_ORIGINS" ]; then
    print_error "No origins provided. Exiting."
    exit 1
fi

# Build the allowed origins list with proper protocols
ALLOWED_ORIGINS=""
IFS=',' read -ra ADDR <<< "$NEW_ORIGINS"
for domain in "${ADDR[@]}"; do
    # Trim whitespace
    domain=$(echo "$domain" | xargs)
    
    # Skip empty entries
    if [ -z "$domain" ]; then
        continue
    fi
    
    # Check if it's an IP address (simple check)
    if [[ $domain =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        # It's an IP - add HTTP
        if [ -z "$ALLOWED_ORIGINS" ]; then
            ALLOWED_ORIGINS="http://$domain"
        else
            ALLOWED_ORIGINS="$ALLOWED_ORIGINS,http://$domain"
        fi
    else
        # It's a domain - add both HTTP and HTTPS
        domain=$(echo "$domain" | sed 's|^https\?://||')  # Remove protocol if present
        if [ -z "$ALLOWED_ORIGINS" ]; then
            ALLOWED_ORIGINS="https://$domain,http://$domain"
        else
            ALLOWED_ORIGINS="$ALLOWED_ORIGINS,https://$domain,http://$domain"
        fi
    fi
done

print_status "Will configure CORS for: $ALLOWED_ORIGINS"

# Confirm the change
echo ""
read -p "Proceed with this CORS configuration? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    print_error "Cancelled by user"
    exit 1
fi

# Update .env file
print_status "Updating environment configuration..."
if [ -f ".env" ]; then
    # Remove existing ALLOWED_ORIGINS line
    sed -i '/^ALLOWED_ORIGINS=/d' .env
fi
echo "ALLOWED_ORIGINS=$ALLOWED_ORIGINS" >> .env

# Restart the application
print_status "Restarting application with new CORS settings..."
docker compose restart app

# Wait a moment for the restart
sleep 5

# Test the configuration
print_status "Testing CORS configuration..."
if curl -s -f "http://localhost:3000/api/health" > /dev/null; then
    print_success "Application restarted successfully"
else
    print_error "Application may not have restarted properly. Check logs with: docker compose logs app"
fi

echo ""
print_success "✅ CORS configuration updated!"
echo ""
echo -e "${GREEN}🔒 New CORS settings:${NC}"
echo -e "${BLUE}$ALLOWED_ORIGINS${NC}"
echo ""
echo -e "${YELLOW}📝 Notes:${NC}"
echo "• Only the specified domains/IPs can now access your API"
echo "• Changes take effect immediately"
echo "• To add more domains later, run this script again"
echo ""
echo -e "${YELLOW}🔍 Test your CORS settings:${NC}"
echo "curl -H \"Origin: https://yourdomain.com\" http://$SERVER_IP/api/health"
echo ""
