import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const deckSchema = z.object({
  name: z.string().min(3, {
    message: "Deck name must be at least 3 characters long",
  }),
  description: z.string().optional().nullable(),
  format: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  colors: z.array(z.enum(["W", "U", "R", "B", "G", "C"])).default([]),
});

async function POST(request: NextRequest) {
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
    console.log(deck);

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error("Error creating deck:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create deck" },
      { status: 500 }
    );
  }
}

export { POST };
