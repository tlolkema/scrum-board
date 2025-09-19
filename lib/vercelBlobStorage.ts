import { put, del, list } from "@vercel/blob";
import { BoardState, Ticket } from "./types";

const BOARD_STATE_KEY = "scrum-board-state";

export class VercelBlobStorage {
  private static instance: VercelBlobStorage;
  private boardState: BoardState | null = null;

  private constructor() {}

  public static getInstance(): VercelBlobStorage {
    if (!VercelBlobStorage.instance) {
      VercelBlobStorage.instance = new VercelBlobStorage();
    }
    return VercelBlobStorage.instance;
  }

  async getBoardState(): Promise<BoardState> {
    if (this.boardState) {
      return this.boardState;
    }

    try {
      // Check if we have a blob token
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.log("No Vercel Blob token found, using in-memory storage");
        this.boardState = {
          tickets: [],
          nextId: 1,
        };
        return this.boardState;
      }

      const blobs = await list({ prefix: BOARD_STATE_KEY });
      if (blobs.blobs.length === 0) {
        // Initialize with empty state
        this.boardState = {
          tickets: [],
          nextId: 1,
        };
        await this.saveBoardState();
        return this.boardState;
      }

      // Get the latest state file
      const latestBlob = blobs.blobs.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )[0];

      const response = await fetch(latestBlob.url);
      this.boardState = await response.json();
      return this.boardState!;
    } catch (error) {
      console.error("Error loading board state:", error);
      // Return empty state if loading fails
      this.boardState = {
        tickets: [],
        nextId: 1,
      };
      return this.boardState;
    }
  }

  async saveBoardState(): Promise<void> {
    if (!this.boardState) return;

    try {
      // Check if we have a blob token
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.log(
          "No Vercel Blob token found, skipping save (using in-memory storage)"
        );
        return;
      }

      const filename = `${BOARD_STATE_KEY}-${Date.now()}.json`;
      await put(filename, JSON.stringify(this.boardState), {
        access: "public",
        contentType: "application/json",
      });
    } catch (error) {
      console.error("Error saving board state:", error);
      throw error;
    }
  }

  async createTicket(title: string, description: string): Promise<Ticket> {
    const state = await this.getBoardState();

    const ticket: Ticket = {
      id: state.nextId,
      title,
      description,
      status: "todo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.tickets.push(ticket);
    state.nextId++;
    this.boardState = state;

    await this.saveBoardState();
    return ticket;
  }

  async updateTicket(
    id: number,
    updates: Partial<Ticket>
  ): Promise<Ticket | null> {
    const state = await this.getBoardState();
    const ticketIndex = state.tickets.findIndex((t) => t.id === id);

    if (ticketIndex === -1) {
      return null;
    }

    const updatedTicket = {
      ...state.tickets[ticketIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    state.tickets[ticketIndex] = updatedTicket;
    this.boardState = state;

    await this.saveBoardState();
    return updatedTicket;
  }

  async deleteTicket(id: number): Promise<boolean> {
    const state = await this.getBoardState();
    const ticketIndex = state.tickets.findIndex((t) => t.id === id);

    if (ticketIndex === -1) {
      return false;
    }

    state.tickets.splice(ticketIndex, 1);
    this.boardState = state;

    await this.saveBoardState();
    return true;
  }

  async getTicket(id: number): Promise<Ticket | null> {
    const state = await this.getBoardState();
    return state.tickets.find((t) => t.id === id) || null;
  }
}
