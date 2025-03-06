import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { CARD_DATA_PATH } from "@/lib/constants";
import { Card } from "@/models/Card";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), CARD_DATA_PATH);
    const data = await fs.readFile(filePath, "utf-8");
    const cards: Card[] = JSON.parse(data);
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error loading cards:", error);
    return NextResponse.json(
      { error: "Failed to load cards" },
      { status: 500 }
    );
  }
}
