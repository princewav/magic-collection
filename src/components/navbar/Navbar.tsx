'use client';

import { Book, Heart, ListChecks, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Logo } from '../Logo';
import { ThemeToggle } from '../theme/ThemeToggle';
import { ListItem } from './NavListItem';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

function getTriggerStyleClasses(active?: boolean) {
  return cn(
    'inline-flex h-auto w-max flex-col items-center justify-center gap-0.5 rounded-md px-4 py-1 text-xs font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 md:flex-row md:gap-2 md:text-sm',
    'hover:bg-accent/10 focus:bg-accent/20',
    active
      ? 'bg-secondary/30 font-semibold dark:bg-primary/10 dark:hover:bg-primary/20'
      : 'bg-transparent',
  );
}

const Navbar: React.FC<{}> = () => {
  const pathname = usePathname();
  return (
    <nav
      className="bg-sidebar fixed right-0 bottom-0 left-0 z-10 flex border-t p-1 px-4 text-xs shadow-md md:relative md:bottom-auto md:border-t-0 md:px-4 md:py-1 md:text-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mr-2 flex items-center py-0.5 text-xl font-bold md:mr-4 md:block md:text-2xl">
        <Link href="/" aria-label="Home">
          <Logo className="w-15" />
        </Link>
      </div>

      <NavigationMenu
        className="flex-grow justify-around md:justify-start md:gap-4"
        delayDuration={100}
      >
        <NavigationMenuList className="flex w-full justify-around md:w-auto md:justify-start md:gap-4">
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={getTriggerStyleClasses(pathname.startsWith('/decks'))}
            >
              <Book className="text-accent h-5 w-5" aria-hidden="true" />
              <span className="text-xs md:text-base">Decks</span>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[150px] gap-1 p-2 md:w-[180px] md:gap-2 md:p-3">
                <ListItem
                  href="/decks/paper"
                  title="Paper Decks"
                  imageSrc="/images/card-w.png"
                />
                <ListItem
                  href="/decks/arena"
                  title="Arena Decks"
                  imageSrc="/images/arena-w.png"
                />
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={getTriggerStyleClasses(
                pathname.startsWith('/collection'),
              )}
            >
              <ListChecks className="text-accent h-5 w-5" aria-hidden="true" />
              <span className="text-xs md:text-base">Collect</span>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[150px] gap-1 p-2 md:w-[180px] md:gap-2 md:p-3">
                <ListItem
                  href="/collection/paper"
                  title="Paper Collection"
                  imageSrc="/images/card-w.png"
                />
                <ListItem
                  href="/collection/arena"
                  title="Arena Collection"
                  imageSrc="/images/arena-w.png"
                />
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/wishlists" legacyBehavior passHref>
              <NavigationMenuLink
                className={getTriggerStyleClasses(
                  pathname.startsWith('/wishlists'),
                )}
                active={pathname.startsWith('/wishlists')}
              >
                <Heart className="text-accent size-5" aria-hidden="true" />
                <span className="text-xs md:text-base">Wishlists</span>
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>

        {/* --- Responsive Viewport --- */}
        {/* Positioned below triggers on mobile (bottom nav), above on desktop */}
        {/* Added translate-y to create separation from the navbar */}
        <div className="absolute right-0 bottom-full left-0 flex -translate-y-26 justify-center md:top-full md:right-auto md:bottom-auto md:left-auto md:translate-y-2">
          <NavigationMenuViewport className="origin-bottom-center md:origin-top-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-popover text-popover-foreground relative mt-0 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow-lg md:w-[var(--radix-navigation-menu-viewport-width)]" />
        </div>
      </NavigationMenu>

      <div className="flex items-center">
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
