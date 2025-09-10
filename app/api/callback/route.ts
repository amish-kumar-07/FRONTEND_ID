import { NextRequest, NextResponse } from "next/server";
import { db } from "../../db/index";
import { usersTable } from "../../db/schema";

export async function POST(req: NextRequest) {
  try {
    // Try parsing JSON first
    let bodyText: string;
    try {
      const body = await req.json<{ output?: string }>();
      bodyText = body.output ?? JSON.stringify(body);
    } catch {
      // If it wasn’t JSON, fallback to raw text
      bodyText = await req.text();
    }

    if (!bodyText) {
      return NextResponse.json(
        { error: "No crawl report received" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(usersTable)
      .values({ output: bodyText })
      .returning();

    return NextResponse.json(
      { message: "Report saved", data: inserted[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error inserting crawl report:", error);
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 }
    );
  }
}
