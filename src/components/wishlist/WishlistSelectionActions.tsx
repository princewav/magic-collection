'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useWishlistSelection } from '@/context/WishlistSelectionContext';
import { deleteWishlists } from '@/actions/wishlist/delete-wishlists';
import { mergeWishlists } from '@/actions/wishlist/merge-wishlists';
import { Trash, Merge } from 'lucide-react';

interface WishlistSelectionActionsProps {
  wishlistCount: number;
}

export const WishlistSelectionActions: React.FC<
  WishlistSelectionActionsProps
> = ({ wishlistCount }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const { selectedWishlists, clearWishlistSelection } = useWishlistSelection();
  const router = useRouter();

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${wishlistCount} wishlist${
          wishlistCount > 1 ? 's' : ''
        }?`,
      )
    ) {
      try {
        setIsDeleting(true);
        const result = await deleteWishlists(selectedWishlists);
        clearWishlistSelection();

        if (result.success) {
          toast.success(result.message || 'Wishlists deleted');
        } else {
          toast.error(result.message || 'Failed to delete wishlists');
        }

        router.refresh();
      } catch (error) {
        console.error('Error deleting wishlists:', error);
        toast.error('Failed to delete wishlists');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleMerge = async () => {
    if (selectedWishlists.length < 2) {
      toast.error('Select at least two wishlists to merge');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to merge ${wishlistCount} wishlists?`,
      )
    ) {
      try {
        setIsMerging(true);
        const result = await mergeWishlists(selectedWishlists);
        clearWishlistSelection();

        if (result.success) {
          toast.success(result.message || 'Wishlists merged');
          if (result.id) {
            router.push(`/wishlists/${result.id}`);
          }
        } else {
          toast.error(result.message || 'Failed to merge wishlists');
        }

        router.refresh();
      } catch (error) {
        console.error('Error merging wishlists:', error);
        toast.error('Failed to merge wishlists');
      } finally {
        setIsMerging(false);
      }
    }
  };

  return (
    <div className="bg-card animate-in fade-in fixed bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 rounded-lg px-4 py-2 shadow-lg">
      <span className="font-medium">
        {wishlistCount} wishlist{wishlistCount > 1 ? 's' : ''} selected
      </span>

      <div className="flex items-center gap-2">
        <button
          disabled={isMerging || isDeleting || selectedWishlists.length < 2}
          onClick={handleMerge}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1 rounded-md px-3 py-1 text-sm disabled:opacity-50"
        >
          {isMerging ? (
            'Merging...'
          ) : (
            <>
              <Merge className="h-4 w-4" />
              Merge
            </>
          )}
        </button>

        <button
          disabled={isDeleting || isMerging}
          onClick={handleDelete}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center gap-1 rounded-md px-3 py-1 text-sm disabled:opacity-50"
        >
          {isDeleting ? (
            'Deleting...'
          ) : (
            <>
              <Trash className="h-4 w-4" />
              Delete
            </>
          )}
        </button>

        <button
          onClick={clearWishlistSelection}
          className="bg-secondary hover:bg-secondary/80 rounded-md px-3 py-1 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
