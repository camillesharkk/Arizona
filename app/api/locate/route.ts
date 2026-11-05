import { NextResponse } from "next/server";
import { locateUsCode } from "@/lib/locate-region";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const latitude = Number(body?.latitude);
  const longitude = Number(body?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: "unreadable" }, { status: 400 });
  }
  const code = locateUsCode(latitude, longitude);
  if (!code || code === "DC") return NextResponse.json({ match: code ? "unlisted" : "outside" });
  return NextResponse.json({ match: "us", code });
}
