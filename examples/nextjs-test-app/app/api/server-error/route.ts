import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Internal Server Error — simulated by ghostbug demo" },
    { status: 500 }
  );
}
