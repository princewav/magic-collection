'use client';

import { cn } from '@/lib/utils';
import { Book, Heart, ListChecks } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { UserMenu } from './UserMenu';
import Image from 'next/image';
export default function MobileNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(
    null,
  );

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  return (
    <div className="md:hidden">
      {/* Dropdowns */}
      <div
        className={cn(
          'bg-sidebar fixed right-0 bottom-16 left-0 z-40 overflow-hidden border-t transition-all duration-300',
          activeDropdown === 'decks' ? 'max-h-32' : 'max-h-0',
        )}
      >
        <div className="space-y-1 p-2">
          <Link
            href="/decks/paper"
            className="hover:bg-accent/10 focus:bg-accent/20 flex items-center gap-2 rounded-md p-3 text-sm leading-none font-medium whitespace-nowrap"
            onClick={() => setActiveDropdown(null)}
          >
            <Image
              src="/images/card-w.png"
              alt=""
              width={12}
              height={12}
              className="invert-75 md:h-[15px] md:w-[15px] dark:invert-0"
            />
            Paper Decks
          </Link>
          <Link
            href="/decks/arena"
            className="hover:bg-accent/10 focus:bg-accent/20 flex items-center gap-2 rounded-md p-3 text-sm leading-none font-medium whitespace-nowrap"
            onClick={() => setActiveDropdown(null)}
          >
            <Image
              src="/images/arena-w.png"
              alt=""
              width={12}
              height={12}
              className="invert-75 md:h-[15px] md:w-[15px] dark:invert-0"
            />
            Arena Decks
          </Link>
        </div>
      </div>

      <div
        className={cn(
          'bg-sidebar fixed right-0 bottom-16 left-0 z-40 overflow-hidden border-t transition-all duration-300',
          activeDropdown === 'collect' ? 'max-h-32' : 'max-h-0',
        )}
      >
        <div className="space-y-1 p-2">
          <Link
            href="/collection/paper"
            className="hover:bg-accent/10 focus:bg-accent/20 flex items-center gap-2 rounded-md p-3 text-sm leading-none font-medium whitespace-nowrap"
            onClick={() => setActiveDropdown(null)}
          >
            <Image
              src="/images/card-w.png"
              alt=""
              width={15}
              height={15}
              className="invert-75 md:h-[15px] md:w-[15px] dark:invert-0"
            />
            Paper Collection
          </Link>
          <Link
            href="/collection/arena"
            className="hover:bg-accent/10 focus:bg-accent/20 flex items-center gap-2 rounded-md p-3 text-sm leading-none font-medium whitespace-nowrap"
            onClick={() => setActiveDropdown(null)}
          >
            <Image
              src="/images/arena-w.png"
              alt=""
              width={15}
              height={15}
              className="invert-75 md:h-[15px] md:w-[15px] dark:invert-0"
            />
            Arena Collection
          </Link>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-background fixed right-0 bottom-0 left-0 z-50 flex border-t">
        <div className="grid h-16 w-full grid-cols-3">
          {/* Decks */}
          <button
            className={cn(
              'flex flex-col items-center justify-center gap-1',
              pathname.includes('/decks') || activeDropdown === 'decks'
                ? 'bg-secondary/30 dark:bg-primary/10 dark:hover:bg-primary/20 font-semibold'
                : '',
            )}
            onClick={() => toggleDropdown('decks')}
          >
            <Book className="text-accent h-5 w-5" aria-hidden="true" />
            <span className="text-xs">Decks</span>
          </button>

          {/* Collect */}
          <button
            className={cn(
              'flex flex-col items-center justify-center gap-1',
              pathname.includes('/collection') || activeDropdown === 'collect'
                ? 'bg-secondary/30 dark:bg-primary/10 dark:hover:bg-primary/20 font-semibold'
                : '',
            )}
            onClick={() => toggleDropdown('collect')}
          >
            <ListChecks className="text-accent h-5 w-5" aria-hidden="true" />
            <span className="text-xs">Collect</span>
          </button>

          {/* Wishlists */}
          <Link
            href="/wishlists"
            className={cn(
              'flex flex-col items-center justify-center gap-1',
              pathname.includes('/wishlists')
                ? 'bg-secondary/30 dark:bg-primary/10 dark:hover:bg-primary/20 font-semibold'
                : '',
            )}
            onClick={() => setActiveDropdown(null)}
          >
            <Heart className="text-accent size-5" aria-hidden="true" />
            <span className="text-xs">Wishlists</span>
          </Link>

          {/* Profile */}
        </div>
        <div className="mx-3 flex items-center gap-2">
          <UserMenu session={session} />
        </div>
      </div>
    </div>
  );
}
