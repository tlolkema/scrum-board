"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Ticket, BoardState } from "@/lib/types";
import Column from "./Column";
import CreateTicketModal from "./CreateTicketModal";
import TicketDetailModal from "./TicketDetailModal";
import ApiSpecModal from "./ApiSpecModal";

export default function ScrumBoard() {
  const [boardState, setBoardState] = useState<BoardState>({
    tickets: [],
    nextId: 1,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApiSpecModalOpen, setIsApiSpecModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Initialize Server-Sent Events for real-time updates
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectToSSE = () => {
      try {
        eventSource = new EventSource("/api/ws");

        eventSource.onopen = () => {
          console.log("SSE connection opened");
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "board-updated") {
              setBoardState(data.data);
            } else if (
              data.type === "ticket-created" ||
              data.type === "ticket-updated" ||
              data.type === "ticket-deleted"
            ) {
              // Reload the entire board state to ensure consistency
              loadBoardState();
            }
          } catch (error) {
            console.error("Error parsing SSE message:", error);
          }
        };

        eventSource.onerror = (error) => {
          console.error("SSE connection error:", error);
          setIsConnected(false);

          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (eventSource) {
              eventSource.close();
            }
            connectToSSE();
          }, 3000);
        };
      } catch (error) {
        console.error("Failed to create SSE connection:", error);
        setIsConnected(false);
      }
    };

    connectToSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadBoardState();
  }, []);

  const loadBoardState = async () => {
    try {
      const response = await fetch("/api/tickets");
      const data = await response.json();
      setBoardState(data);
    } catch (error) {
      console.error("Error loading board state:", error);
    }
  };

  const handleCreateTicket = async (title: string, description: string) => {
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      // Immediately reload the board state to show the new ticket
      await loadBoardState();
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  };

  const handleUpdateTicket = async (id: number, updates: Partial<Ticket>) => {
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update ticket");
      }

      // Immediately reload the board state to show the updated ticket
      await loadBoardState();
    } catch (error) {
      console.error("Error updating ticket:", error);
      throw error;
    }
  };

  const handleDeleteTicket = async (id: number) => {
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete ticket");
      }

      // Immediately reload the board state to show the updated ticket list
      await loadBoardState();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      throw error;
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const ticketId = parseInt(draggableId);
    const newStatus = destination.droppableId as
      | "todo"
      | "in-progress"
      | "done";

    try {
      await handleUpdateTicket(ticketId, { status: newStatus });
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const getTicketsByStatus = (status: "todo" | "in-progress" | "done") => {
    return boardState.tickets.filter((ticket) => ticket.status === status);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-0">
          <div className="flex items-center">
            <img
              src="/img/logo.png"
              alt="Scrum Board Logo"
              className="h-60 w-auto mr-4"
            />
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="create-ticket-btn"
          >
            Create Ticket
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Column
              title="To Do"
              status="todo"
              tickets={getTicketsByStatus("todo")}
              onTicketClick={handleTicketClick}
            />
            <Column
              title="In Progress"
              status="in-progress"
              tickets={getTicketsByStatus("in-progress")}
              onTicketClick={handleTicketClick}
            />
            <Column
              title="Done"
              status="done"
              tickets={getTicketsByStatus("done")}
              onTicketClick={handleTicketClick}
            />
          </div>
        </DragDropContext>
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTicket={handleCreateTicket}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicket(null);
        }}
        onUpdateTicket={handleUpdateTicket}
      />

      <ApiSpecModal
        isOpen={isApiSpecModalOpen}
        onClose={() => setIsApiSpecModalOpen(false)}
      />

      <div className="mt-8 mb-8 text-center">
        <p className="text-sm text-gray-500">
          By{" "}
          <a
            href="https://www.linkedin.com/in/timlolkema/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 underline"
          >
            Tim Lolkema
          </a>
          {" • "}
          <button
            onClick={() => setIsApiSpecModalOpen(true)}
            className="text-gray-500 hover:text-gray-700 underline inline-flex items-center gap-1"
          >
            API Spec
          </button>
        </p>
      </div>
    </div>
  );
}
