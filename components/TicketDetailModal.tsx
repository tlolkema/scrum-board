"use client";

import React, { useState } from "react";
import { Ticket } from "@/lib/types";

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTicket: (id: number, updates: Partial<Ticket>) => Promise<void>;
}

export default function TicketDetailModal({
  ticket,
  isOpen,
  onClose,
  onUpdateTicket,
}: TicketDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when ticket changes
  React.useEffect(() => {
    if (ticket) {
      setTitle(ticket.title);
      setDescription(ticket.description);
      setStatus(ticket.status);
    }
  }, [ticket]);

  const handleSave = async () => {
    if (!ticket) return;

    setIsSubmitting(true);
    try {
      await onUpdateTicket(ticket.id, {
        title: title.trim(),
        description: description.trim(),
        status,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Ticket #{ticket.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                rows={6}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "todo" | "in-progress" | "done")
                }
                className="form-input"
                disabled={isSubmitting}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
                disabled={isSubmitting || !title.trim() || !description.trim()}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {ticket.title}
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                Status:{" "}
                <span className="font-medium capitalize">
                  {ticket.status.replace("-", " ")}
                </span>
              </span>
              <span>
                Created: {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
              <span>
                Updated: {new Date(ticket.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
