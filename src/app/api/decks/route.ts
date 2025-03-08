import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deckService } from "@/db/services/DeckService";


const deckSchema = z.object({
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

    const deck = await deckService.repo.create({
      id: '',
      name: body.name,
      description: body.description || '',
      format: body.format || '',
      colors: body.colors || [],
      imageUrl: body.imageUrl || null,
      type: "deck"
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
