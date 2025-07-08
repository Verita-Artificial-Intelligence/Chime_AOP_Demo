#!/bin/bash
# Quick deploy script - just paste this entire block after SSH

cd /root && \
apt update -y && \
apt install -y nodejs npm git nginx && \
npm install -g pm2 && \
git clone https://github.com/Verita-Artificial-Intelligence/Chime_AOP_Demo.git && \
cd Chime_AOP_Demo/frontend/webhook-server && \
git checkout feature/add-login-authentication && \
npm install && \
echo -e "NODE_ENV=production\nPORT=3001" > .env && \
pm2 start server.js --name webhook-server && \
pm2 save && \
pm2 startup systemd -u root --hp /root && \
echo 'server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}' > /etc/nginx/sites-available/default && \
systemctl restart nginx && \
echo "✅ Webhook server deployed successfully!" && \
echo "Test with: curl http://$(curl -s ifconfig.me)/health"