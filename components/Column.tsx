"use client";

import { Ticket } from "@/lib/types";
import TicketCard from "./TicketCard";
import { Droppable } from "react-beautiful-dnd";

interface ColumnProps {
  title: string;
  status: "todo" | "in-progress" | "done";
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

export default function Column({
  title,
  status,
  tickets,
  onTicketClick,
}: ColumnProps) {
  return (
    <div className="column">
      <h2 className="column-header">{title}</h2>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[300px] ${
              snapshot.isDraggingOver ? "bg-blue-50" : ""
            }`}
          >
            {tickets.map((ticket, index) => (
              <div key={ticket.id} className="mb-3">
                <TicketCard ticket={ticket} onClick={onTicketClick} />
              </div>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
