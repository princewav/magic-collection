'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useWishlistSelection } from '@/context/WishlistSelectionContext';
import { deleteWishlists } from '@/actions/wishlist/delete-wishlists';
import { mergeWishlists } from '@/actions/wishlist/merge-wishlists';
import { Trash, Merge } from 'lucide-react';
import { Button } from '../ui/button';
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
    <div className="bg-card animate-in fade-in fixed bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 rounded-lg p-2 pl-3 shadow-lg min-w-max border-secondary/6 *:0 border-1">
      <span className="font-medium">
        {wishlistCount} selected
      </span>

      <div className="flex items-center gap-2">
        <Button
          disabled={isMerging || isDeleting || selectedWishlists.length < 2}
          onClick={handleMerge}
          className="rounded-md px-3 py-1 text-sm"
        >
          {isMerging ? (
            'Merging...'
          ) : (
            <>
              <Merge className="h-4 w-4" />
              <span className="hidden md:block">Merge</span>
            </>
          )}
        </Button>

        <Button
          variant="destructive"
          disabled={isDeleting || isMerging}
          onClick={handleDelete}
          className="rounded-md px-3 py-1 text-sm"
        >
          {isDeleting ? (
            'Deleting...'
          ) : (
            <>
              <Trash className="h-4 w-4" />
              <span className="hidden md:block">Delete</span>
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={clearWishlistSelection}
          className="rounded-md px-3 py-1 text-sm border-primary/10 border-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
