import { NextRequest } from "next/server";
import { wsManager } from "@/lib/websocket";

export async function GET(request: NextRequest) {
  // This endpoint is used to establish WebSocket connections
  // The actual WebSocket handling is done in the WebSocketManager
  return new Response("WebSocket endpoint", { status: 200 });
}
