'use client';

import {
  DecksHeaderSkeleton,
  DecksListSkeleton,
} from '@/components/deck/DecksListSkeleton';

export default function Loading() {
  return (
    <main className="container mx-auto p-6">
      <DecksListSkeleton />
    </main>
  );
}
