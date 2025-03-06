// src/app/decks/new/validation.ts
import * as z from "zod";

export const deckSchema = z.object({
  name: z.string().min(3, {
    message: "Deck name must be at least 3 characters long",
  }),
  description: z.string().optional().nullable(),
  format: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  colors: z.array(z.enum(["W", "U", "R", "B", "G", "C"])).default([]),
});
