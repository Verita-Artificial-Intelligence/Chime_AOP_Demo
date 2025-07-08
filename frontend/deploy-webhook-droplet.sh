#!/bin/bash

# This script creates a DigitalOcean droplet for the webhook server

TOKEN="$1"

if [ -z "$TOKEN" ]; then
    echo "Usage: ./deploy-webhook-droplet.sh YOUR_DIGITALOCEAN_TOKEN"
    exit 1
fi

echo "Creating webhook server droplet..."

curl -X POST -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "name":"verita-webhook-server",
        "size":"s-2vcpu-4gb-amd",
        "region":"sfo3",
        "image":"ubuntu-24-10-x64",
        "vpc_uuid":"c6926903-9a9e-45d9-8034-d7bd3372bfc7",
        "user_data":"#!/bin/bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs git nginx build-essential
npm install -g pm2
cd /root
git clone https://github.com/Verita-Artificial-Intelligence/Chime_AOP_Demo.git
cd Chime_AOP_Demo/frontend/webhook-server
git checkout feature/add-login-authentication
npm install
echo \"NODE_ENV=production\" > .env
echo \"PORT=3001\" >> .env
pm2 start server.js --name webhook-server
pm2 save
pm2 startup systemd -u root --hp /root
cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\$host;
    }
}
EOF
systemctl restart nginx
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable"
    }' \
    "https://api.digitalocean.com/v2/droplets"

echo ""
echo "Droplet creation request sent. Check your DigitalOcean dashboard for the new droplet."
echo "Once created, the webhook server will be automatically installed."