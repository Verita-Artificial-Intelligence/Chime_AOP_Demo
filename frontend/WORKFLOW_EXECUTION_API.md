# Workflow Execution API Documentation

## Overview

This document describes the implementation of the workflow execution system that integrates with the n8n backend as specified in the technical requirements.

## Architecture

### 1. Workflow Trigger (Frontend → Backend)

**Endpoint**: `http://143.198.111.85:5678/webhook/mock-workflow`  
**Method**: POST  
**Headers**: `Content-Type: application/json`  
**Body**: Array of workflow steps

```json
[
  {
    "step": 1,
    "action": "read",
    "heading": "Read input business list",
    "element_type": "file",
    "element_description": "Read the provided list of businesses for audit",
    "url": "https://my-json-server.typicode.com/typicode/demo/comments"
  },
  // ... more steps
]
```

### 2. UI Listener Endpoint (Backend → Frontend)

**Webhook Server URL**: `http://localhost:3001/api/status-update`  
**Method**: POST  
**Body**:

```json
{
  "workflowId": "workflow_1234567890",
  "step": 3,
  "status": "completed",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 3. Step Rate Control & Fallback Policy

#### A. Staggered Rendering (Max 1 Step / Second)
- Updates from the backend are queued
- A timer processes one step from the queue every second
- Creates smooth visual progression for users

#### B. Client-Side Fallback (Min 1 Step / 5 Seconds)
- If no update received for 5+ seconds, fallback mode activates
- Frontend auto-completes next step every 5 seconds
- Prevents UI from appearing frozen

## Setup Instructions

### 1. Start the Webhook Server

```bash
# Option 1: Run webhook server only
npm run webhook

# Option 2: Run both frontend and webhook server
npm run dev:all
```

The webhook server will start on port 3001 and provide:
- Health check: `http://localhost:3001/health`
- Status update endpoint: `http://localhost:3001/api/status-update`
- SSE endpoint for real-time updates

### 2. Access the Workflow Executor

1. Navigate to http://localhost:3000
2. Log in (any username/password)
3. Go to "Active Workflows" in the sidebar
4. Click "Start Workflow" to trigger execution

### 3. Backend Integration

Provide this webhook URL to the backend team:
```
http://localhost:3001/api/status-update
```

The backend should POST to this endpoint when each step completes.

## Implementation Details

### Key Components

1. **WorkflowService** (`src/services/workflowService.ts`)
   - Handles POST request to backend webhook
   - Manages workflow execution state
   - Provides sample workflow steps

2. **WebhookService** (`src/services/webhookService.ts`)
   - Manages Server-Sent Events connection
   - Receives real-time updates from webhook server
   - Health check functionality

3. **useWorkflowExecution Hook** (`src/hooks/useWorkflowExecution.ts`)
   - Orchestrates workflow execution
   - Implements step queuing and rate control
   - Handles fallback mechanism
   - Manages state updates

4. **WorkflowExecutor Component** (`src/components/WorkflowExecutor.tsx`)
   - UI for workflow visualization
   - Progress tracking
   - Step status display
   - Backend integration info

5. **Webhook Server** (`src/api/server.js`)
   - Express server for receiving backend updates
   - SSE for real-time frontend communication
   - CORS enabled for cross-origin requests

## Testing

### Manual Testing

1. **Test Backend Integration**:
   ```bash
   curl -X POST http://localhost:3001/api/status-update \
     -H "Content-Type: application/json" \
     -d '{"workflowId": "workflow_123", "step": 2, "status": "completed"}'
   ```

2. **Test Fallback Mode**:
   - Start a workflow
   - Don't send any backend updates
   - After 5 seconds, steps should auto-complete

3. **Test Rate Control**:
   - Send multiple updates rapidly
   - UI should only update once per second

### Production Deployment

For production:
1. Deploy webhook server to a public URL
2. Update `WebhookService.webhookServerUrl`
3. Provide public webhook URL to backend team
4. Consider using environment variables for configuration

## Security Considerations

- CORS is configured for development
- In production, restrict CORS to specific origins
- Consider authentication for webhook endpoint
- Use HTTPS for all endpoints