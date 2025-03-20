'use client';

import { WishlistForm } from '@/components/form/WishlistForm';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { wishlistSchema } from './validation';
import { createWishlist } from '@/actions/wishlist/create-wishlist';

export default function NewWishlistPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWishlistCreation = async (
    values: z.infer<typeof wishlistSchema>,
  ) => {
    setIsSubmitting(true);
    try {
      await createWishlist(values);
      toast.success('Wishlist Created', {
        description: 'Your new wishlist has been created successfully.',
      });
      router.push('/wishlists');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating wishlist:', error);
      toast.error('Error', {
        description:
          error.message || 'Failed to create wishlist. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-7xl flex-col p-4">
      <h1 className="mb-6 text-4xl font-bold">Create New Wishlist</h1>
      <WishlistForm
        onSubmit={handleWishlistCreation}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
