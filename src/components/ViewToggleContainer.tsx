'use client';

import { ViewToggle } from '@/components/ViewToggle';

export function ViewToggleContainer() {
  return (
    <div className="flex items-center">
      <span className="text-muted-foreground mr-2 text-sm">View:</span>
      <ViewToggle />
    </div>
  );
}
