#!/bin/bash

# Webhook Server Droplet Setup Script
# Run this on your DigitalOcean droplet as root

echo "=== Verita Webhook Server Setup ==="
echo "This script will set up your webhook server on this droplet"
echo ""

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js
echo "Installing Node.js v18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install required packages
echo "Installing Git, Nginx, and build tools..."
apt install -y git nginx build-essential

# Install PM2
echo "Installing PM2..."
npm install -g pm2

# Clone repository
echo "Cloning repository..."
mkdir -p /var/www
cd /var/www

if [ -d "Chime_AOP_Demo" ]; then
    echo "Repository already exists, pulling latest..."
    cd Chime_AOP_Demo
    git pull
else
    git clone https://github.com/Verita-Artificial-Intelligence/Chime_AOP_Demo.git
    cd Chime_AOP_Demo
fi

# Checkout correct branch
git checkout feature/add-login-authentication

# Setup webhook server
echo "Setting up webhook server..."
cd frontend/webhook-server
npm install

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=3001
EOF

# Start with PM2
echo "Starting webhook server with PM2..."
pm2 delete webhook-server 2>/dev/null || true
pm2 start server.js --name "webhook-server"
pm2 save
pm2 startup systemd -u root --hp /root

# Get the droplet's IP
DROPLET_IP=$(curl -s http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address)

# Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/webhook-server << EOF
server {
    listen 80;
    server_name $DROPLET_IP;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/webhook-server /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t && systemctl restart nginx

# Configure firewall
echo "Configuring firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Your webhook server is now running at:"
echo "http://$DROPLET_IP"
echo ""
echo "Webhook endpoint for backend:"
echo "http://$DROPLET_IP/api/status-update"
echo ""
echo "To check status:"
echo "  pm2 status"
echo "  pm2 logs webhook-server"
echo ""
echo "To test:"
echo "  curl http://$DROPLET_IP/health"
echo ""