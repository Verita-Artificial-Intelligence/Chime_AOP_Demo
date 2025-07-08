# DigitalOcean Deployment Guide for Webhook Server

## Prerequisites

1. DigitalOcean account
2. GitHub repository access to `Verita-Artificial-Intelligence/Chime_AOP_Demo`
3. DigitalOcean CLI (doctl) installed (optional)

## Deployment Steps

### Option 1: Using DigitalOcean App Platform UI

1. **Log in to DigitalOcean**
   - Go to https://cloud.digitalocean.com/

2. **Create New App**
   - Click "Create" → "Apps"
   - Choose "GitHub" as source
   - Authorize DigitalOcean to access your GitHub account
   - Select repository: `Verita-Artificial-Intelligence/Chime_AOP_Demo`
   - Branch: `feature/add-login-authentication`

3. **Configure App**
   - Name: `verita-webhook-server`
   - Region: Choose closest to your users (e.g., NYC)
   - Source Directory: `/frontend/webhook-server`

4. **Configure Build & Run**
   - Build Command: `npm install`
   - Run Command: `npm start`
   - HTTP Port: `3001`

5. **Environment Variables**
   - Add these environment variables:
     ```
     NODE_ENV=production
     PORT=3001
     ```

6. **Choose Plan**
   - Select "Basic" plan ($5/month)
   - Instance size: Basic XXS (512 MB RAM, 1 vCPU)

7. **Deploy**
   - Click "Create Resources"
   - Wait for deployment to complete

### Option 2: Using doctl CLI

```bash
# Install doctl if not already installed
brew install doctl  # macOS
# or download from https://docs.digitalocean.com/reference/doctl/how-to/install/

# Authenticate
doctl auth init

# Create app using app.yaml
cd frontend/webhook-server
doctl apps create --spec app.yaml
```

## Post-Deployment Configuration

### 1. Get Your App URL

After deployment, your webhook server will be available at:
```
https://verita-webhook-server-xxxxx.ondigitalocean.app
```

The exact URL will be shown in the DigitalOcean dashboard.

### 2. Update Frontend Configuration

Create a `.env.production` file in your frontend directory:

```bash
# frontend/.env.production
VITE_WEBHOOK_SERVER_URL=https://verita-webhook-server-xxxxx.ondigitalocean.app
```

### 3. Update Backend Configuration

Provide this webhook URL to the backend team:
```
https://verita-webhook-server-xxxxx.ondigitalocean.app/api/status-update
```

### 4. Test the Deployment

```bash
# Health check
curl https://verita-webhook-server-xxxxx.ondigitalocean.app/health

# Test webhook endpoint
curl -X POST https://verita-webhook-server-xxxxx.ondigitalocean.app/api/status-update \
  -H "Content-Type: application/json" \
  -d '{"workflowId":"test","step":1,"status":"completed"}'
```

## Monitoring & Logs

### View Logs
```bash
# Using doctl
doctl apps logs <APP_ID> --type=run

# Or in DigitalOcean dashboard
# Go to your app → "Runtime Logs" tab
```

### Monitor Health
- DigitalOcean automatically monitors your app
- Set up alerts in the dashboard under "Insights"

## Updating the App

### Automatic Deployments
With `deploy_on_push: true` in app.yaml, any push to the `feature/add-login-authentication` branch will trigger a new deployment.

### Manual Deployment
```bash
# Using doctl
doctl apps create-deployment <APP_ID>

# Or in dashboard
# Go to your app → "Deploy" → "Deploy Branch"
```

## Custom Domain (Optional)

1. In DigitalOcean dashboard, go to your app
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Security Considerations

1. **CORS Configuration**
   - Update `app.yaml` to restrict allowed origins in production
   - Remove `localhost` origins before going live

2. **Authentication**
   - Consider adding API key authentication for the webhook endpoint
   - Example:
     ```javascript
     const API_KEY = process.env.WEBHOOK_API_KEY;
     
     app.post('/api/status-update', (req, res) => {
       if (req.headers['x-api-key'] !== API_KEY) {
         return res.status(401).json({ error: 'Unauthorized' });
       }
       // ... rest of handler
     });
     ```

3. **Rate Limiting**
   - Consider adding rate limiting to prevent abuse
   - Can use `express-rate-limit` package

## Troubleshooting

### App Won't Start
- Check build logs in DigitalOcean dashboard
- Verify `package.json` is in the source directory
- Check Node.js version compatibility

### 502 Bad Gateway
- Check runtime logs for errors
- Verify PORT environment variable matches HTTP port setting
- Ensure server is binding to `0.0.0.0` not `localhost`

### CORS Issues
- Update allowed origins in `app.yaml`
- Ensure frontend URL is included in CORS configuration

## Cost Optimization

- Basic XXS ($5/month) should be sufficient for webhook processing
- Monitor usage and scale up only if needed
- Consider using App Platform's autoscaling features for production