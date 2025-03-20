'use client';

import { useState } from 'react';
import { WishlistForm } from '@/components/form/WishlistForm';
import { Wishlist } from '@/types/wishlist';
import { wishlistSchema } from '@/app/wishlists/new/validation';
import { updateWishlist } from '@/actions/wishlist/update-wishlist';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';

interface EditWishlistFormProps {
  wishlist: Wishlist;
}

export function EditWishlistForm({ wishlist }: EditWishlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleWishlistUpdate = async (data: z.infer<typeof wishlistSchema>) => {
    try {
      setIsSubmitting(true);
      const result = await updateWishlist({
        id: wishlist.id,
        ...data,
      });

      if (result.success) {
        toast.success('Wishlist updated successfully');
        router.push(`/wishlists/${wishlist.id}`);
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to update wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WishlistForm
      onSubmit={handleWishlistUpdate}
      isSubmitting={isSubmitting}
      initialData={wishlist}
      submitLabel="Update Wishlist"
    />
  );
}
