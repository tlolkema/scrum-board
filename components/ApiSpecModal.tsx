"use client";

import { useState } from "react";

interface ApiSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiSpecModal({ isOpen, onClose }: ApiSpecModalProps) {
  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">API Specification</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            Complete API documentation with examples for the Scrum Board
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Base URL */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Base URL
            </h3>
            <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
              <span className="text-gray-600">Production:</span>{" "}
              https://your-domain.vercel.app
              <br />
              <span className="text-gray-600">Local:</span>{" "}
              http://localhost:3000
            </div>
          </div>

          {/* GET All Tickets */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Get All Tickets
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                  GET
                </span>
                <code className="text-sm">/api/tickets</code>
                <button
                  onClick={() => copyToClipboard("GET /api/tickets")}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Copy
                </button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {`// Response
{
  "tickets": [
    {
      "id": 1,
      "title": "Implement user authentication",
      "description": "Add login and registration functionality",
      "status": "todo",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* POST Create Ticket */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Create Ticket
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                  POST
                </span>
                <code className="text-sm">/api/tickets</code>
                <button
                  onClick={() => copyToClipboard("POST /api/tickets")}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Copy
                </button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {`// Request Body
{
  "title": "Fix responsive design",
  "description": "Make the board mobile-friendly"
}

// Response (201 Created)
{
  "id": 2,
  "title": "Fix responsive design",
  "description": "Make the board mobile-friendly",
  "status": "todo",
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* GET Single Ticket */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Get Single Ticket
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                  GET
                </span>
                <code className="text-sm">/api/tickets/[id]</code>
                <button
                  onClick={() => copyToClipboard("GET /api/tickets/1")}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Copy
                </button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {`// Example: GET /api/tickets/1

// Response
{
  "id": 1,
  "title": "Implement user authentication",
  "description": "Add login and registration functionality",
  "status": "todo",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* PUT Update Ticket */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Update Ticket
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-mono">
                  PUT
                </span>
                <code className="text-sm">/api/tickets/[id]</code>
                <button
                  onClick={() => copyToClipboard("PUT /api/tickets/1")}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Copy
                </button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {`// Request Body
{
  "title": "Updated ticket title",
  "description": "Updated description",
  "status": "in-progress"
}

// Response
{
  "id": 1,
  "title": "Updated ticket title",
  "description": "Updated description",
  "status": "in-progress",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* DELETE Ticket */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Delete Ticket
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">
                  DELETE
                </span>
                <code className="text-sm">/api/tickets/[id]</code>
                <button
                  onClick={() => copyToClipboard("DELETE /api/tickets/1")}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Copy
                </button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {`// Example: DELETE /api/tickets/1

// Response (200 OK)
{
  "success": true
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* WebSocket Events */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              WebSocket Events
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Connection</h4>
                <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                  <pre>ws://localhost:3000/api/ws</pre>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-700 mb-1">
                    ticket-created
                  </h4>
                  <div className="bg-gray-900 text-gray-100 p-2 rounded font-mono text-sm">
                    <pre>{`{ "type": "ticket-created", "ticket": { ... } }`}</pre>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-700 mb-1">
                    ticket-updated
                  </h4>
                  <div className="bg-gray-900 text-gray-100 p-2 rounded font-mono text-sm">
                    <pre>{`{ "type": "ticket-updated", "ticket": { ... } }`}</pre>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-700 mb-1">
                    ticket-deleted
                  </h4>
                  <div className="bg-gray-900 text-gray-100 p-2 rounded font-mono text-sm">
                    <pre>{`{ "type": "ticket-deleted", "ticketId": 1 }`}</pre>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-700 mb-1">
                    board-updated
                  </h4>
                  <div className="bg-gray-900 text-gray-100 p-2 rounded font-mono text-sm">
                    <pre>{`{ "type": "board-updated", "tickets": [ ... ] }`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Responses */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Error Responses
            </h3>
            <div className="space-y-3">
              <div className="bg-red-50 p-3 rounded">
                <h4 className="font-semibold text-red-800 mb-1">
                  400 Bad Request
                </h4>
                <div className="bg-gray-900 text-gray-100 p-2 rounded font-mono text-sm">
                  <pre>{`{ "error": "Invalid ticket ID" }`}</pre>
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded">
                <h4 className="font-semibold text-red-800 mb-1">
                  404 Not Found
                </h4>
                <div className="bg-gray-900 text-gray-100 p-2 rounded font-mono text-sm">
                  <pre>{`{ "error": "Ticket not found" }`}</pre>
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded">
                <h4 className="font-semibold text-red-800 mb-1">
                  500 Internal Server Error
                </h4>
                <div className="bg-gray-900 text-gray-100 p-2 rounded font-mono text-sm">
                  <pre>{`{ "error": "Failed to fetch tickets" }`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              All endpoints return JSON responses
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
