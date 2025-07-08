# DigitalOcean Droplet Deployment Commands

## 1. Create Droplet with User Data (Automated Setup)

Replace `YOUR_TOKEN` with your DigitalOcean API token:

```bash
TOKEN="YOUR_TOKEN"

curl -X POST -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "name":"verita-webhook-server",
        "size":"s-1vcpu-1gb",
        "region":"nyc3",
        "image":"ubuntu-22-04-x64",
        "user_data":"#!/bin/bash
# This script runs automatically when the droplet is created
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs git nginx build-essential
npm install -g pm2
mkdir -p /var/www && cd /var/www
git clone https://github.com/Verita-Artificial-Intelligence/Chime_AOP_Demo.git
cd Chime_AOP_Demo && git checkout feature/add-login-authentication
cd frontend/webhook-server && npm install
echo \"NODE_ENV=production\" > .env
echo \"PORT=3001\" >> .env
pm2 start server.js --name webhook-server
pm2 save && pm2 startup systemd -u root --hp /root
cat > /etc/nginx/sites-available/webhook-server << EOF
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF
ln -sf /etc/nginx/sites-available/webhook-server /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable"
    }' \
    "https://api.digitalocean.com/v2/droplets"
```

## 2. Get Droplet Information

After creating, get the droplet ID from the response, then check status:

```bash
# Get droplet info (replace DROPLET_ID)
curl -X GET -H "Authorization: Bearer $TOKEN" \
    "https://api.digitalocean.com/v2/droplets/DROPLET_ID"
```

## 3. Get All Droplets (to find your IP)

```bash
curl -X GET -H "Authorization: Bearer $TOKEN" \
    "https://api.digitalocean.com/v2/droplets" | jq '.droplets[] | select(.name=="verita-webhook-server") | {name, ip: .networks.v4[0].ip_address, status}'
```

## 4. Manual Setup (If User Data Fails)

Once you have the IP address, SSH in and run:

```bash
ssh root@YOUR_DROPLET_IP

# Then run our setup script
curl -o setup.sh https://raw.githubusercontent.com/Verita-Artificial-Intelligence/Chime_AOP_Demo/feature/add-login-authentication/frontend/webhook-server/setup-droplet.sh
chmod +x setup.sh
./setup.sh
```

## 5. Verify Deployment

```bash
# Check webhook server health
curl http://YOUR_DROPLET_IP/health

# Test webhook endpoint
curl -X POST http://YOUR_DROPLET_IP/api/status-update \
  -H "Content-Type: application/json" \
  -d '{"workflowId":"test","step":1,"status":"completed"}'
```

## Using Your Specific VPC

If you want to use your specific VPC configuration:

```bash
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
pm2 start server.js --name webhook-server
pm2 save
pm2 startup"
    }' \
    "https://api.digitalocean.com/v2/droplets"
```

## After Deployment

1. Update your frontend `.env.production`:
```
VITE_WEBHOOK_SERVER_URL=http://YOUR_DROPLET_IP
```

2. Share with backend team:
```
Webhook URL: http://YOUR_DROPLET_IP/api/status-update
```