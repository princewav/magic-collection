import * as z from 'zod';

export const deckSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: 'Deck name must be at least 3 characters.',
    })
    .transform((val) => val.trim()),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .url()
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  format: z.string().default('standard'),
  type: z.enum(['paper', 'arena']).default('paper'),
  decklist: z.string().min(1, {
    message: 'Deck list is required.',
  }),
});
