import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: "Practice questions load through the practice session." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
}
