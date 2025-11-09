# Simple Scrum Board

A collaborative scrum board application built with Next.js, featuring efficient version-based polling for multi-user collaboration and persistent storage using Vercel Blob.

> https://scrum-board-navy.vercel.app/

<div align="center">
  <img src="./public/img/readme.png" alt="Scrum Board" width="600" height="auto" />
</div>

## Features

- **3 Column Layout**: To Do, In Progress, and Done columns
- **Multi-User Collaboration**: Multiple users can work simultaneously with efficient version-based polling
- **Ticket Management**: Create, edit, and delete tickets with full details
- **Persistent Storage**: All data is stored in Vercel Blob storage
- **Version Tracking**: Uses Vercel KV for efficient change detection
- **REST API**: Access tickets via `/api/tickets/` endpoints
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+
- Vercel account for deployment
- Vercel Blob storage configured
- Vercel KV storage configured (for version tracking)

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
4. Connect your Vercel KV storage
5. Set environment variables:
   - `BLOB_READ_WRITE_TOKEN` - From Vercel Blob
   - `KV_REST_API_URL` - From Vercel KV
   - `KV_REST_API_TOKEN` - From Vercel KV
6. Deploy!

## API Endpoints

- `GET /api/tickets?version=<number>` - Get all tickets and board state (optional version parameter for efficient polling)
  - Returns `304 Not Modified` if version matches (no data transfer)
  - Returns full board state with updated version if changed
- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets/[id]` - Get a specific ticket by ID
- `PUT /api/tickets/[id]` - Update a ticket
- `DELETE /api/tickets/[id]` - Delete a ticket

## How It Works

The application uses **version-based polling** for efficient multi-user collaboration:

1. **Version Tracking**: Each board state change increments a version number stored in Vercel KV
2. **Efficient Polling**: Clients poll with their last known version
3. **304 Responses**: Server returns `304 Not Modified` when versions match (minimal compute and bandwidth)
4. **Smart Polling**: 
   - Polls every 20 seconds when idle
   - Polls immediately after user actions
   - Polls when tab becomes visible (Page Visibility API)
   - Stops polling when tab is hidden to save compute

This approach eliminates persistent connections while maintaining responsive multi-user collaboration with minimal server compute.

## License

Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License

By Tim Lolkema
