# DigitalOcean Droplet Deployment Guide

## Connect to Your Droplet

1. **SSH into your droplet**
```bash
ssh root@your-droplet-ip
```

## Initial Server Setup

### 1. Update System
```bash
apt update && apt upgrade -y
```

### 2. Install Node.js (v18+)
```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install Git
```bash
apt install git -y
```

### 4. Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### 5. Install Nginx (Reverse Proxy)
```bash
apt install nginx -y
```

## Deploy Webhook Server

### 1. Clone Repository
```bash
# Create app directory
mkdir -p /var/www
cd /var/www

# Clone the repository
git clone https://github.com/Verita-Artificial-Intelligence/Chime_AOP_Demo.git
cd Chime_AOP_Demo

# Checkout the correct branch
git checkout feature/add-login-authentication
```

### 2. Setup Webhook Server
```bash
# Navigate to webhook server directory
cd frontend/webhook-server

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=3001
EOF
```

### 3. Start Server with PM2
```bash
# Start the server
pm2 start server.js --name "webhook-server"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
```

### 4. Configure Nginx
```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/webhook-server << 'EOF'
server {
    listen 80;
    server_name your-droplet-ip;  # Replace with your droplet IP or domain

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/webhook-server /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 5. Configure Firewall
```bash
# Allow SSH, HTTP, and HTTPS
ufw allow 22
ufw allow 80
ufw allow 443

# Enable firewall
ufw --force enable
```

## Setup SSL (Optional but Recommended)

### Using Let's Encrypt
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

## Verify Deployment

### 1. Check PM2 Status
```bash
pm2 status
pm2 logs webhook-server
```

### 2. Test Endpoints
```bash
# From your local machine
curl http://your-droplet-ip/health

# Test webhook endpoint
curl -X POST http://your-droplet-ip/api/status-update \
  -H "Content-Type: application/json" \
  -d '{"workflowId":"test","step":1,"status":"completed"}'
```

## Update Frontend Configuration

1. Create `.env.production` in your frontend:
```bash
VITE_WEBHOOK_SERVER_URL=http://your-droplet-ip
# or if using domain with SSL
VITE_WEBHOOK_SERVER_URL=https://your-domain.com
```

## Maintenance Commands

### View Logs
```bash
# PM2 logs
pm2 logs webhook-server

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart webhook server
pm2 restart webhook-server

# Restart Nginx
systemctl restart nginx
```

### Update Code
```bash
cd /var/www/Chime_AOP_Demo
git pull origin feature/add-login-authentication
cd frontend/webhook-server
npm install
pm2 restart webhook-server
```

## Monitoring

### Setup PM2 Monitoring
```bash
# Show detailed info
pm2 info webhook-server

# Monitor in real-time
pm2 monit
```

### System Resources
```bash
# Check memory and CPU
htop

# Check disk space
df -h
```

## Security Recommendations

1. **Create Non-Root User**
```bash
adduser webhook
usermod -aG sudo webhook
# Then run PM2 as this user
```

2. **Configure Fail2ban**
```bash
apt install fail2ban -y
```

3. **Regular Updates**
```bash
# Create update script
cat > /root/update.sh << 'EOF'
#!/bin/bash
apt update && apt upgrade -y
cd /var/www/Chime_AOP_Demo
git pull
cd frontend/webhook-server
npm install
pm2 restart webhook-server
EOF

chmod +x /root/update.sh
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001
# Kill if needed
kill -9 <PID>
```

### PM2 Issues
```bash
# Reset PM2
pm2 kill
pm2 start server.js --name "webhook-server"
```

### Nginx Issues
```bash
# Check configuration
nginx -t
# Check error logs
tail -f /var/log/nginx/error.log
```