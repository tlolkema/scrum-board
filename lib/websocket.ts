import { WebSocket, WebSocketServer } from "ws";
import { WebSocketMessage } from "./types";

class WebSocketManager {
  private static instance: WebSocketManager;
  private clients: Set<WebSocket> = new Set();
  private wss: any = null;

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public initialize(server: any) {
    if (this.wss) return;

    this.wss = new WebSocketServer({ server });

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("New client connected");
      this.clients.add(ws);

      ws.on("close", () => {
        console.log("Client disconnected");
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.clients.delete(ws);
      });
    });
  }

  public broadcast(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
        } catch (error) {
          console.error("Error sending message to client:", error);
          this.clients.delete(client);
        }
      }
    });
  }

  public getClientCount(): number {
    return this.clients.size;
  }
}

export const wsManager = WebSocketManager.getInstance();
