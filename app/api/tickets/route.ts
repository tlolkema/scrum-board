import { NextRequest, NextResponse } from "next/server";
import { VercelBlobStorage } from "@/lib/vercelBlobStorage";
import { CreateTicketRequest } from "@/lib/types";
import { versionManager } from "@/lib/versionManager";

const storage = VercelBlobStorage.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientVersion = searchParams.get("version");
    const forceRefresh = searchParams.has("t"); // Any query param triggers refresh
    
    // If client provided a version, check if it matches
    if (clientVersion && !forceRefresh) {
      const clientVersionNum = parseInt(clientVersion, 10);
      if (!isNaN(clientVersionNum)) {
        const versionsMatch = await versionManager.compareVersion(clientVersionNum);
        if (versionsMatch) {
          // Versions match - return 304 Not Modified
          return new NextResponse(null, {
            status: 304,
            headers: {
              "Cache-Control": "no-cache, must-revalidate",
              "ETag": `"${clientVersionNum}"`,
            },
          });
        }
      }
    }
    
    // Versions don't match or no version provided - return full state
    const boardState = await storage.getBoardState(forceRefresh);
    const serverVersion = boardState.version;
    
    return NextResponse.json(boardState, {
      headers: {
        "Cache-Control": "no-cache, must-revalidate",
        "ETag": `"${serverVersion}"`,
        "Last-Modified": new Date().toUTCString(),
      },
    });
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
