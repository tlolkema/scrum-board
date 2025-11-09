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
    version: 0,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApiSpecModalOpen, setIsApiSpecModalOpen] = useState(false);

  // Version-based polling for real-time updates
  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let pollTimeout: ReturnType<typeof setTimeout> | null = null;
    let isPageVisible = true;
    const pollIntervalMs = 20000; // Poll every 20 seconds when idle

    const pollBoardState = async () => {
      if (!isPageVisible) {
        return;
      }

      const currentVersion = boardState.version;
      const url = currentVersion
        ? `/api/tickets?version=${currentVersion}`
        : "/api/tickets";

      try {
        const response = await fetch(url);
        
        if (response.status === 304) {
          // No changes - version matches, no update needed
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: BoardState = await response.json();
        setBoardState(data);
      } catch (error) {
        console.error("Error polling board state:", error);
      }
    };

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      
      if (isPageVisible) {
        // Page became visible - poll immediately
        pollBoardState();
        // Then continue polling at interval
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        pollInterval = setInterval(pollBoardState, pollIntervalMs);
      } else {
        // Page hidden - stop polling to save compute
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        if (pollTimeout) {
          clearTimeout(pollTimeout);
          pollTimeout = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start polling when page is visible
    if (isPageVisible) {
      pollInterval = setInterval(pollBoardState, pollIntervalMs);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (pollTimeout) {
        clearTimeout(pollTimeout);
      }
    };
  }, [boardState.version]);

  // Load initial data
  useEffect(() => {
    loadBoardState();
  }, []);

  const loadBoardState = async (forceRefresh = false) => {
    try {
      const currentVersion = boardState.version;
      let url: string;
      
      if (forceRefresh) {
        // Force refresh - bypass version check
        url = `/api/tickets?t=${Date.now()}`;
      } else if (currentVersion) {
        // Include version for efficient polling
        url = `/api/tickets?version=${currentVersion}`;
      } else {
        // Initial load - no version yet
        url = "/api/tickets";
      }

      const response = await fetch(url);
      
      if (response.status === 304) {
        // No changes - version matches, no update needed
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BoardState = await response.json();
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

      const newTicket: Ticket = await response.json();

      // Optimistically update the UI with the new ticket
      setBoardState((prevState) => ({
        ...prevState,
        tickets: [...prevState.tickets, newTicket],
        nextId: Math.max(prevState.nextId, newTicket.id + 1),
      }));

      // Poll immediately after action to get fresh state with updated version
      setTimeout(() => {
        loadBoardState(true);
      }, 500);
    } catch (error) {
      console.error("Error creating ticket:", error);
      // Only reload on error to ensure consistency
      await loadBoardState(true);
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

      // Optimistically update the UI
      setBoardState((prevState) => ({
        ...prevState,
        tickets: prevState.tickets.map((ticket) =>
          ticket.id === id ? { ...ticket, ...updates } : ticket
        ),
      }));

      // Poll immediately after action to get fresh state with updated version
      setTimeout(() => {
        loadBoardState(true);
      }, 500);
    } catch (error) {
      console.error("Error updating ticket:", error);
      // Only reload on error to ensure consistency
      await loadBoardState(true);
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

      // Optimistically update the UI
      setBoardState((prevState) => ({
        ...prevState,
        tickets: prevState.tickets.filter((ticket) => ticket.id !== id),
      }));

      // Poll immediately after action to get fresh state with updated version
      setTimeout(() => {
        loadBoardState(true);
      }, 500);
    } catch (error) {
      console.error("Error deleting ticket:", error);
      // Only reload on error to ensure consistency
      await loadBoardState(true);
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
