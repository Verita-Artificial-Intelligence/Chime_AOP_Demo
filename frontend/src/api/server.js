import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;

// Store workflow update callbacks
const workflowUpdateCallbacks = new Map();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET handler for status-update endpoint (for browser access)
app.get('/api/status-update', (req, res) => {
  res.json({
    message: 'This endpoint accepts POST requests only',
    usage: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        workflowId: 'workflow_123',
        step: 1,
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    },
    example: `curl -X POST http://localhost:3001/api/status-update -H "Content-Type: application/json" -d '{"workflowId":"workflow_123","step":1,"status":"completed"}'`
  });
});

// Webhook endpoint to receive status updates from n8n backend
app.post('/api/status-update', (req, res) => {
  console.log('Received status update:', req.body);
  
  try {
    const { workflowId, step, status, timestamp } = req.body;
    
    // Broadcast the update to all connected clients
    if (workflowUpdateCallbacks.has(workflowId)) {
      const callback = workflowUpdateCallbacks.get(workflowId);
      callback({ step, status, timestamp });
    }
    
    // Send acknowledgment
    res.json({ 
      success: true, 
      message: 'Status update received',
      processedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing status update:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process update' 
    });
  }
});

// SSE endpoint for frontend to subscribe to updates
app.get('/api/workflow-updates/:workflowId', (req, res) => {
  const { workflowId } = req.params;
  
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', workflowId })}\n\n`);
  
  // Register callback for this workflow
  const sendUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  workflowUpdateCallbacks.set(workflowId, sendUpdate);
  
  // Clean up on disconnect
  req.on('close', () => {
    workflowUpdateCallbacks.delete(workflowId);
  });
});

app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
  console.log(`Status update endpoint: http://localhost:${PORT}/api/status-update`);
});