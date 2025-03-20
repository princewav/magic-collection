import * as z from 'zod';

export const wishlistSchema = z.object({
  name: z.string().min(3, {
    message: 'Wishlist name must be at least 3 characters.',
  }),
  colors: z
    .array(z.enum(['W', 'U', 'R', 'B', 'G', 'C']))
    .min(0)
    .default([]),
  imageUrl: z
    .string()
    .url()
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
});
