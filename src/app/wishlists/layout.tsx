'use client';

import React from 'react';
import { WishlistSelectionProvider } from '@/context/WishlistSelectionContext';

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WishlistSelectionProvider>{children}</WishlistSelectionProvider>;
}
