import { NextRequest, NextResponse } from "next/server";
import { VercelBlobStorage } from "@/lib/vercelBlobStorage";
import { CreateTicketRequest } from "@/lib/types";

const storage = VercelBlobStorage.getInstance();

export async function GET() {
  try {
    const boardState = await storage.getBoardState();
    return NextResponse.json(boardState);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTicketRequest = await request.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const ticket = await storage.createTicket(body.title, body.description);

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
