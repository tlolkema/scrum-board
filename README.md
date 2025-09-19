# Simple Scrum Board

A collaborative scrum board application built with Next.js, featuring real-time updates via WebSockets and persistent storage using Vercel Blob.

<div align="center">
  <img src="./public/img/logo.png" alt="Scrum Board" width="600" height="auto" />
</div>

## Features

- **3 Column Layout**: To Do, In Progress, and Done columns
- **Real-time Collaboration**: Multiple users can work simultaneously with WebSocket updates
- **Ticket Management**: Create, edit, and delete tickets with full details
- **Persistent Storage**: All data is stored in Vercel Blob storage
- **REST API**: Access tickets via `/api/issue-{id}` endpoints
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+
- Vercel account for deployment
- Vercel Blob storage configured

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Connect your Vercel Blob storage
4. Deploy!

## API Endpoints

- `GET /api/tickets` - Get all tickets and board state
- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets/[id]` - Get a specific ticket by ID
- `PUT /api/tickets/[id]` - Update a ticket
- `DELETE /api/tickets/[id]` - Delete a ticket
- `GET /api/ws` - WebSocket endpoint for real-time updates

## WebSocket Events

The application uses WebSockets for real-time updates:

- `ticket-created` - When a new ticket is created
- `ticket-updated` - When a ticket is modified
- `ticket-deleted` - When a ticket is removed
- `board-updated` - When the entire board state changes

## License

Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License

By Tim Lolkema

---

<div align="center">
  <p class="text-sm text-gray-500">
    <a href="#" class="text-blue-600 hover:text-blue-800 underline">
      📖 View API Specification
    </a>
    <br>
    <em>Click the "API Spec" link in the app footer to see detailed API documentation with examples</em>
  </p>
</div>
