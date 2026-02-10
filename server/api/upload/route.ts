import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Not implemented yet",
      message: "CSV/Excel upload flow is planned for Phase 5."
    },
    { status: 501 }
  );
}

