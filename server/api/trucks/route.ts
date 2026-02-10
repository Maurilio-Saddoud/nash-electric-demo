import { NextResponse } from "next/server";
import { listTrucks } from "@/lib/inventory-store";

export async function GET() {
  return NextResponse.json({ data: listTrucks() });
}

