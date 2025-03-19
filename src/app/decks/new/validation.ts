import * as z from 'zod';

export const deckSchema = z.object({
  name: z.string().min(3, {
    message: 'Deck name must be at least 3 characters.',
  }),
  colors: z.array(z.enum(['W', 'U', 'R', 'B', 'G', 'C'])).min(1, {
    // Modified line: Ensure at least one color is selected
    message: 'Please select at least one color.',
  }),
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
  decklist: z.string().optional(),
});
