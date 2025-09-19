import { NextRequest } from "next/server";
import { eventEmitter } from "@/lib/eventEmitter";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// Store active connections with metadata
const connections = new Map<
  ReadableStreamDefaultController,
  {
    id: string;
    lastPing: number;
    isAlive: boolean;
  }
>();

// Cleanup function
const cleanup = (controller: ReadableStreamDefaultController) => {
  const connection = connections.get(controller);
  if (connection) {
    connections.delete(controller);
    console.log(`SSE connection ${connection.id} cleaned up`);
  }
};

// Ping function to keep connections alive
const pingConnections = () => {
  const now = Date.now();
  const pingData = `data: ${JSON.stringify({
    type: "ping",
    timestamp: now,
  })}\n\n`;

  for (const [controller, connection] of connections) {
    try {
      if (controller.desiredSize !== null) {
        controller.enqueue(new TextEncoder().encode(pingData));
        connection.lastPing = now;
        connection.isAlive = true;
      } else {
        cleanup(controller);
      }
    } catch (error) {
      console.error("Error pinging connection:", error);
      cleanup(controller);
    }
  }
};

// Ping every 30 seconds
setInterval(pingConnections, 30000);

// Cleanup dead connections every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [controller, connection] of connections) {
    if (now - connection.lastPing > 120000) {
      // 2 minutes without ping
      console.log(`Cleaning up dead SSE connection ${connection.id}`);
      cleanup(controller);
    }
  }
}, 60000);

export async function GET(request: NextRequest) {
  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const connectionId = `conn_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Add this connection to our set
      connections.set(controller, {
        id: connectionId,
        lastPing: Date.now(),
        isAlive: true,
      });

      console.log(`SSE connection ${connectionId} established`);

      // Send initial connection message
      const initData = `data: ${JSON.stringify({
        type: "connected",
        connectionId,
        timestamp: Date.now(),
      })}\n\n`;

      try {
        controller.enqueue(new TextEncoder().encode(initData));
      } catch (error) {
        console.error("Error sending initial message:", error);
        cleanup(controller);
        return;
      }

      // Listen for board updates
      const handleUpdate = (data: any) => {
        try {
          if (controller.desiredSize !== null) {
            const message = `data: ${JSON.stringify({
              ...data,
              timestamp: Date.now(),
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(message));
          } else {
            cleanup(controller);
          }
        } catch (error) {
          console.error("Error sending update message:", error);
          cleanup(controller);
        }
      };

      // Add event listeners
      eventEmitter.on("board-updated", handleUpdate);
      eventEmitter.on("ticket-created", handleUpdate);
      eventEmitter.on("ticket-updated", handleUpdate);
      eventEmitter.on("ticket-deleted", handleUpdate);

      // Clean up when connection closes
      const cleanupHandler = () => {
        eventEmitter.off("board-updated", handleUpdate);
        eventEmitter.off("ticket-created", handleUpdate);
        eventEmitter.off("ticket-updated", handleUpdate);
        eventEmitter.off("ticket-deleted", handleUpdate);
        cleanup(controller);
      };

      request.signal.addEventListener("abort", cleanupHandler);

      // Also clean up on stream close
      controller.signal?.addEventListener("abort", cleanupHandler);
    },

    cancel() {
      // Handle stream cancellation
      for (const [controller] of connections) {
        if (controller === this) {
          cleanup(controller);
          break;
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
      "Access-Control-Allow-Methods": "GET",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
