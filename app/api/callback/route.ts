// app/api/callback/route.ts
import { NextResponse, NextRequest } from 'next/server';

// Define the log data type
interface LogData {
  message?: string;
  level?: string;
  service?: string;
  timestamp?: string;
  id?: string;
  type?: string;
  [key: string]: unknown; // Allow additional properties
}

// Define the client connection type
interface SSEClient {
  id: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
}

// Store active SSE connections
const clients = new Set<SSEClient>();

// Helper function to broadcast to all connected clients
function broadcast(data: LogData): void {
  const message = `data: ${JSON.stringify(data)}\n\n`;
     
  clients.forEach((client: SSEClient) => {
    try {
      client.controller.enqueue(new TextEncoder().encode(message));
    } catch {
      // Remove disconnected clients
      clients.delete(client);
    }
  });
}

// POST endpoint - Receive logs from external services
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const logData: LogData = await request.json();
         
    // Add timestamp if not provided
    const enrichedLog: LogData = {
      ...logData,
      timestamp: logData.timestamp || new Date().toISOString(),
      id: logData.id || Date.now().toString()
    };
         
    // Broadcast to all connected clients
    broadcast(enrichedLog);
         
    return NextResponse.json({
      success: true,
      message: 'Log broadcasted successfully',
      clientCount: clients.size
    });
       
  } catch {
    console.error('Error processing log data');
    return NextResponse.json(
      { success: false, message: 'Invalid JSON data' },
      { status: 400 }
    );
  }
}

// GET endpoint - Server-Sent Events stream
export async function GET(): Promise<Response> {
  const stream = new ReadableStream<Uint8Array>({
    start(controller: ReadableStreamDefaultController<Uint8Array>) {
      // Create client connection object
      const client: SSEClient = {
        id: Date.now().toString(),
        controller: controller
      };
             
      // Add to active connections
      clients.add(client);
             
      // Send initial connection message
      const welcomeMessage = `data: ${JSON.stringify({
        type: 'connection',
        message: 'Connected to log stream',
        timestamp: new Date().toISOString(),
        clientCount: clients.size
      })}\n\n`;
             
      controller.enqueue(new TextEncoder().encode(welcomeMessage));
             
      console.log(`Client ${client.id} connected. Total clients: ${clients.size}`);
    },
         
    cancel() {
      // Clean up on client disconnect
      clients.forEach((client: SSEClient) => {
        try {
          client.controller.close();
        } catch {
          // Client already disconnected
        }
      });
    }
  });
     
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// OPTIONS endpoint for CORS preflight
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}