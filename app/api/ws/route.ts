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
    pingTimeout: NodeJS.Timeout | null;
    closeTimeout: NodeJS.Timeout | null;
    handleUpdate: (data: any) => void;
  }
>();

// Cleanup function
const cleanup = (controller: ReadableStreamDefaultController) => {
  const connection = connections.get(controller);
  if (connection) {
    // Remove event listeners
    if (connection.handleUpdate) {
      eventEmitter.off("board-updated", connection.handleUpdate);
      eventEmitter.off("ticket-created", connection.handleUpdate);
      eventEmitter.off("ticket-updated", connection.handleUpdate);
      eventEmitter.off("ticket-deleted", connection.handleUpdate);
    }
    
    // Clear timeouts
    if (connection.pingTimeout) {
      clearTimeout(connection.pingTimeout);
    }
    if (connection.closeTimeout) {
      clearTimeout(connection.closeTimeout);
    }
    
    connections.delete(controller);
    console.log(`SSE connection ${connection.id} cleaned up`);
  }
};

// Send ping to a specific connection
const sendPing = (controller: ReadableStreamDefaultController) => {
  const connection = connections.get(controller);
  if (!connection) return;

  try {
    if (controller.desiredSize !== null) {
      const now = Date.now();
      const pingData = `data: ${JSON.stringify({
        type: "ping",
        timestamp: now,
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(pingData));
      connection.lastPing = now;
      connection.isAlive = true;

      // Schedule next ping (every 20 seconds)
      connection.pingTimeout = setTimeout(() => {
        sendPing(controller);
      }, 20000);
    } else {
      cleanup(controller);
    }
  } catch (error) {
    console.error("Error pinging connection:", error);
    cleanup(controller);
  }
};

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
        pingTimeout: null,
        closeTimeout: null,
        handleUpdate: () => {}, // Placeholder, will be set later
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

      // Start ping cycle (first ping after 20 seconds)
      const connection = connections.get(controller);
      if (connection) {
        connection.pingTimeout = setTimeout(() => {
          sendPing(controller);
        }, 20000);

        // Close connection gracefully at 25 seconds to avoid Vercel timeout
        // The client will automatically reconnect
        connection.closeTimeout = setTimeout(() => {
          console.log(`Closing SSE connection ${connectionId} before timeout`);
          try {
            controller.close();
          } catch (error) {
            // Connection may already be closed
          }
          cleanup(controller);
        }, 25000); // Close at 25 seconds, before 30-second Vercel timeout
      }

      // Listen for board updates
      const handleUpdate = (data: any) => {
        // Check if connection still exists and is valid
        const currentConnection = connections.get(controller);
        if (!currentConnection) {
          // Connection was already cleaned up, remove listeners
          eventEmitter.off("board-updated", handleUpdate);
          eventEmitter.off("ticket-created", handleUpdate);
          eventEmitter.off("ticket-updated", handleUpdate);
          eventEmitter.off("ticket-deleted", handleUpdate);
          return;
        }

        try {
          // Check if controller is still valid before enqueueing
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
          // Controller is likely closed, clean up silently
          cleanup(controller);
        }
      };

      // Store the handler in the connection metadata
      const currentConnection = connections.get(controller);
      if (currentConnection) {
        currentConnection.handleUpdate = handleUpdate;
      }

      // Add event listeners
      eventEmitter.on("board-updated", handleUpdate);
      eventEmitter.on("ticket-created", handleUpdate);
      eventEmitter.on("ticket-updated", handleUpdate);
      eventEmitter.on("ticket-deleted", handleUpdate);

      // Clean up when connection closes
      const cleanupHandler = () => {
        cleanup(controller);
      };

      request.signal.addEventListener("abort", cleanupHandler);
    },

    cancel() {
      // Handle stream cancellation
      connections.forEach((connection, controller) => {
        if (controller === this) {
          cleanup(controller);
        }
      });
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
