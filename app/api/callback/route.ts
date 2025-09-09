import { NextRequest, NextResponse } from "next/server";
import { db } from "../../db/index"; // your drizzle db instance
import { usersTable } from "../../db/schema"; // where you defined usersTable

// POST /api/users
export async function POST(req: NextRequest) {
  try {
    // Parse body safely and cast
    const body = (await req.json()) as { output: string };

    if (!body.output) {
      return NextResponse.json(
        { error: "Missing 'output' field" },
        { status: 400 }
      );
    }

    // Insert into DB
    const inserted = await db
      .insert(usersTable)
      .values({
        output: body.output,
      })
      .returning(); // returns inserted row(s)

    return NextResponse.json(
      { message: "User saved", data: inserted[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error inserting into users table:", error);
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}
