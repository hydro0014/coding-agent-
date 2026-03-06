import { NextResponse } from "next/server";
import { tools } from "@/lib/tools";

export const dynamic = "force-dynamic";

export async function GET() {
  const files = await tools.listFiles(".");
  return NextResponse.json(files);
}
