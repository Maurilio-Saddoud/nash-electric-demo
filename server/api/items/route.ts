import { NextRequest, NextResponse } from "next/server";
import { listItems, updateItemQuantity } from "@/lib/inventory-store";

function hasWriteAccess(request: NextRequest) {
  const provided = request.headers.get("x-inventory-write-key");
  const expected = process.env.INVENTORY_WRITE_TOKEN ?? "demo-write-token";
  return provided === expected;
}

export async function GET(request: NextRequest) {
  const truckId = request.nextUrl.searchParams.get("truckId") ?? undefined;
  return NextResponse.json({ data: listItems(truckId) });
}

export async function PUT(request: NextRequest) {
  if (!hasWriteAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    truckId?: string;
    itemId?: string;
    quantity?: number;
  };

  if (!body.truckId || !body.itemId || typeof body.quantity !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = updateItemQuantity(body.truckId, body.itemId, body.quantity);
  if (!updated) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}

