'use client';

import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { GridIcon, ListIcon } from 'lucide-react';

export function ViewToggle() {
  const { layout, setLayout } = useSettings();

  return (
    <div className="bg-muted flex items-center space-x-1 rounded-md p-1">
      <Button
        variant={layout === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLayout('grid')}
        className="h-8 w-8"
      >
        <GridIcon className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        variant={layout === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLayout('list')}
        className="h-8 w-8"
      >
        <ListIcon className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
}
