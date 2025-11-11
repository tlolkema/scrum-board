# Simple Scrum Board

A collaborative scrum board application built with Next.js, featuring automatic syncing via polling and persistent storage using Vercel Blob.

> https://scrum-board-navy.vercel.app/

<div align="center">
  <img src="./public/img/readme.png" alt="Scrum Board" width="600" height="auto" />
</div>

## Features

- **3 Column Layout**: To Do, In Progress, and Done columns
- **Automatic Syncing**: Board state syncs every 30 seconds, with immediate updates for your own changes
- **Ticket Management**: Create, edit, and delete tickets with full details
- **Persistent Storage**: All data is stored in Vercel Blob storage
- **REST API**: Access tickets via `/api/tickets/` endpoints
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

## Real-time Updates

The application uses polling to automatically sync board state every 30 seconds. When you create, update, or delete a ticket, the changes are reflected immediately without waiting for the next poll cycle.

## License

Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License

By Tim Lolkema
