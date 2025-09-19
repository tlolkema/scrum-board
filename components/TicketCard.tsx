"use client";

import { Ticket } from "@/lib/types";
import { useState } from "react";

interface TicketCardProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
}

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div
      className={`ticket-card ${isDragging ? "opacity-50" : ""}`}
      onClick={() => onClick(ticket)}
      draggable
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-gray-500">#{ticket.id}</span>
        <span className="text-xs text-gray-400">
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">
        {truncateText(ticket.title, 50)}
      </h3>
      <p className="text-sm text-gray-600">
        {truncateText(ticket.description, 100)}
      </p>
    </div>
  );
}
