# Verita Webhook Server

This is the webhook server for the Verita AI workflow execution system. It receives status updates from the n8n backend and broadcasts them to the frontend application via Server-Sent Events (SSE).

## Endpoints

- `GET /health` - Health check endpoint
- `GET /api/status-update` - Shows usage information
- `POST /api/status-update` - Receives workflow status updates from backend
- `GET /api/workflow-updates/:workflowId` - SSE endpoint for frontend subscription

## Local Development

```bash
npm install
npm start
```

Server runs on port 3001 by default.

## Production Deployment

This server is configured for deployment on DigitalOcean App Platform.

### Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (production/development)

## API Usage

### Receiving Status Updates

```bash
POST /api/status-update
Content-Type: application/json

{
  "workflowId": "workflow_123",
  "step": 2,
  "status": "completed",
  "timestamp": "2025-01-08T12:00:00Z"
}
```

### Frontend SSE Connection

The frontend connects to `/api/workflow-updates/:workflowId` to receive real-time updates.