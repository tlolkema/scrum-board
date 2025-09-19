import { NextRequest } from "next/server";
import { EventEmitter } from "events";

// Global event emitter for real-time updates
const eventEmitter = new EventEmitter();

// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to our set
      connections.add(controller);

      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: "connected" })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      // Listen for board updates
      const handleUpdate = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(message));
      };

      eventEmitter.on("board-updated", handleUpdate);
      eventEmitter.on("ticket-created", handleUpdate);
      eventEmitter.on("ticket-updated", handleUpdate);
      eventEmitter.on("ticket-deleted", handleUpdate);

      // Clean up when connection closes
      request.signal.addEventListener("abort", () => {
        connections.delete(controller);
        eventEmitter.off("board-updated", handleUpdate);
        eventEmitter.off("ticket-created", handleUpdate);
        eventEmitter.off("ticket-updated", handleUpdate);
        eventEmitter.off("ticket-deleted", handleUpdate);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}

// Export the event emitter so other parts of the app can use it
export { eventEmitter };
