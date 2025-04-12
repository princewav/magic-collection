'use client';

import React, { useState } from 'react';
import { Wishlist } from '@/components/wishlist/Wishlist';
import { useWishlistSelection } from '@/context/WishlistSelectionContext';
import { Wishlist as WishlistType } from '@/types/wishlist';
import { WishlistSelectionActions } from './WishlistSelectionActions';
import { WishlistContextMenu } from './WishlistContextMenu';

type WishlistGridProps = {
  wishlists: WishlistType[];
};

export const WishlistGrid = ({ wishlists }: WishlistGridProps) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    wishlistId: string;
  } | null>(null);
  const { selectedWishlists } = useWishlistSelection();

  const handleContextMenu = (
    e: React.MouseEvent<Element, MouseEvent>,
    wishlistId: string,
  ) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, wishlistId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <div className="relative justify-start gap-6 px-6 space-y-4 sm:grid sm:grid-cols-[repeat(auto-fit,_minmax(200px,250px))] sm:space-y-0 sm:px-0">
      {selectedWishlists.length > 0 && (
        <WishlistSelectionActions wishlistCount={selectedWishlists.length} />
      )}
      {wishlists.map((wishlist) => (
        <Wishlist
          key={wishlist.id}
          wishlist={wishlist}
          onContextMenu={handleContextMenu}
          className="max-w-[300px] w-full mx-auto"
        />
      ))}
      {contextMenu && (
        <WishlistContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          wishlistId={contextMenu.wishlistId}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};
