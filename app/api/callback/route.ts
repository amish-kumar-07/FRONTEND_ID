import { NextRequest, NextResponse } from "next/server";
import { db } from "../../db/index";
import { usersTable } from "../../db/schema";

export async function POST(req: NextRequest) {
  try {
    let reportText: string;

    try {
      // Try parsing JSON first
      const body = (await req.json()) as { output?: string };
      reportText = body.output ?? JSON.stringify(body);
    } catch {
      // If it wasn’t JSON, fallback to raw text
      reportText = await req.text();
    }

    if (!reportText) {
      return NextResponse.json(
        { error: "No crawl report received" },
        { status: 400 }
      );
    }

    // Insert into DB
    const inserted = await db
      .insert(usersTable)
      .values({
        output: reportText, // store report in "output" column
      })
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
