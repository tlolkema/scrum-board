export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  createdAt: string;
  updatedAt: string;
}

export interface BoardState {
  tickets: Ticket[];
  nextId: number;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: "todo" | "in-progress" | "done";
}

export interface WebSocketMessage {
  type:
    | "ticket-created"
    | "ticket-updated"
    | "ticket-deleted"
    | "board-updated";
  data: Ticket | BoardState | { id: number };
}
