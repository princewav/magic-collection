'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteWishlist } from '@/actions/wishlist/delete-wishlist';
import { duplicateWishlist } from '@/actions/wishlist/duplicate-wishlist';
import { Copy, Trash } from 'lucide-react';

interface WishlistContextMenuProps {
  x: number;
  y: number;
  wishlistId: string;
  onClose: () => void;
}

export const WishlistContextMenu: React.FC<WishlistContextMenuProps> = ({
  x,
  y,
  wishlistId,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleDeleteClick = async () => {
    try {
      const result = await deleteWishlist(wishlistId);
      if (result.success) {
        toast.success(result.message || 'Wishlist deleted');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to delete wishlist');
      }
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      toast.error('Failed to delete wishlist');
    } finally {
      onClose();
    }
  };

  const handleDuplicateClick = async () => {
    try {
      const result = await duplicateWishlist(wishlistId);
      if (result.success) {
        toast.success(result.message || 'Wishlist duplicated');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to duplicate wishlist');
      }
    } catch (error) {
      console.error('Error duplicating wishlist:', error);
      toast.error('Failed to duplicate wishlist');
    } finally {
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="bg-card z-50 min-w-32 divide-y overflow-hidden rounded-md border p-1 shadow-md"
      style={{
        position: 'fixed',
        left: x,
        top: y,
      }}
    >
      <div className="flex flex-col">
        <button
          onClick={handleDuplicateClick}
          className="hover:text-accent-foreground hover:bg-accent-foreground/10 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
        >
          <Copy className="size-4" />
          <span>Duplicate</span>
        </button>
        <button
          onClick={handleDeleteClick}
          className="text-destructive hover:text-accent-foreground hover:bg-accent-foreground/10 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
        >
          <Trash className="size-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
