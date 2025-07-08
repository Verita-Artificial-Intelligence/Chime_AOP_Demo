#!/bin/bash

# DigitalOcean Droplet Creation Script for Webhook Server

# Check if TOKEN is provided
if [ -z "$1" ]; then
    echo "Usage: ./create-droplet.sh YOUR_DIGITALOCEAN_TOKEN"
    exit 1
fi

TOKEN=$1

echo "Creating DigitalOcean droplet for Verita Webhook Server..."

# Create the droplet
RESPONSE=$(curl -X POST -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "name":"verita-webhook-server",
        "size":"s-1vcpu-1gb",
        "region":"nyc3",
        "image":"ubuntu-22-04-x64",
        "user_data":"#!/bin/bash
# Automated setup script that runs on first boot
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install required packages
apt install -y git nginx build-essential

# Install PM2
npm install -g pm2

# Clone and setup webhook server
mkdir -p /var/www
cd /var/www
git clone https://github.com/Verita-Artificial-Intelligence/Chime_AOP_Demo.git
cd Chime_AOP_Demo
git checkout feature/add-login-authentication

# Setup webhook server
cd frontend/webhook-server
npm install

# Create environment file
cat > .env << EOL
NODE_ENV=production
PORT=3001
EOL

# Start with PM2
pm2 start server.js --name webhook-server
pm2 save
pm2 startup systemd -u root --hp /root

# Configure Nginx
cat > /etc/nginx/sites-available/webhook-server << EOL
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection '"'"'upgrade'"'"';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

ln -sf /etc/nginx/sites-available/webhook-server /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

# Configure firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
"
    }' \
    "https://api.digitalocean.com/v2/droplets")

# Extract droplet ID and IP from response
DROPLET_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | cut -d: -f2)
DROPLET_NAME=$(echo $RESPONSE | grep -o '"name":"[^"]*' | cut -d'"' -f4)

echo ""
echo "Droplet created successfully!"
echo "Droplet ID: $DROPLET_ID"
echo "Droplet Name: $DROPLET_NAME"
echo ""
echo "The droplet is being created. It will take a few minutes to complete."
echo ""
echo "To check the status and get the IP address, run:"
echo "curl -X GET -H 'Authorization: Bearer $TOKEN' 'https://api.digitalocean.com/v2/droplets/$DROPLET_ID'"
echo ""
echo "Once the droplet is ready, the webhook server will be automatically installed and available at:"
echo "http://[DROPLET_IP]"
echo ""
echo "Webhook endpoint for backend: http://[DROPLET_IP]/api/status-update"