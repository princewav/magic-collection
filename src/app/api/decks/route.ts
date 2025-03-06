import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const deckSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  format: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  colors: z.array(z.enum(["white", "blue", "black", "red", "green", "colorless"])).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const body = deckSchema.parse(json);

    const deck = await prisma.deck.create({
      data: {
        name: body.name,
        description: body.description || null,
        format: body.format || null,
        colors: body.colors, // This will be converted to JSON by Prisma
        imageUrl: body.imageUrl || null,
      },
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error("Error creating deck:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create deck" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const decks = await prisma.deck.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(decks);
  } catch (error) {
    console.error("Error fetching decks:", error);
    return NextResponse.json({ error: "Failed to fetch decks" }, { status: 500 });
  }
}
