'use client';

import { Book, Heart, ListChecks, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Logo } from '../Logo';
import { ThemeToggle } from '../theme/ThemeToggle';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import Image from 'next/image';

function getTriggerStyleClasses(active?: boolean) {
  return cn(
    'inline-flex h-auto w-max flex-col items-center justify-center gap-0.5 rounded-md px-3 py-1 md:py-2 text-xs font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 md:flex-row md:gap-2 md:text-sm',
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
      data-role="navbar-container"
      className="bg-sidebar fixed right-0 bottom-0 left-0 z-10 flex justify-between border-t p-1 px-4 text-xs shadow-md md:relative md:bottom-auto md:justify-start md:border-t-0 md:px-4 md:py-1 md:text-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <Link href="/" aria-label="Home">
        <Logo className="w-15 md:mr-4" />
      </Link>
      <NavigationMenu className="justify-around md:justify-start md:gap-2">
        <NavigationMenuList className="flex justify-around gap-4 sm:gap-8  md:w-auto md:justify-start md:gap-2">
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                getTriggerStyleClasses(pathname.startsWith('/decks')),
                'flex flex-row',
              )}
            >
              <div className="flex flex-col items-center gap-1 md:flex-row">
                <Book className="text-accent h-5 w-5" aria-hidden="true" />
                <span
                  data-role="trigger-label"
                  className="text-xs md:text-base"
                >
                  Decks
                </span>
              </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul data-role="dropdown-list" className="grid">
                <li>
                  <NavigationMenuLink
                    asChild
                    className="flex flex-row items-center gap-2"
                  >
                    <Link
                      href="/decks/paper"
                    >
                      <Image
                        src="/images/card-w.png"
                        alt=""
                        width={12}
                        height={12}
                        className="invert-75 md:h-[15px] md:w-[15px] dark:invert-0"
                      />
                      <p className="md:text-md text-sm leading-none font-medium whitespace-nowrap">
                        Paper Decks
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    asChild
                    className="flex flex-row items-center gap-2"
                  >
                    <Link
                      href="/decks/arena"
                    >
                      <Image
                        src="/images/arena-w.png"
                        alt=""
                        width={12}
                        height={12}
                        className="invert-75 md:h-[15px] md:w-[15px] dark:invert-0"
                      />
                      <p className="md:text-md text-sm leading-none font-medium whitespace-nowrap">
                        Arena Decks
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                getTriggerStyleClasses(pathname.startsWith('/collection')),
                'flex flex-row',
              )}
            >
              <div className="flex flex-col items-center gap-1 md:flex-row">
                <ListChecks
                  className="text-accent h-5 w-5"
                  aria-hidden="true"
                />
                <span
                  data-role="trigger-label"
                  className="text-xs md:text-base"
                >
                  Collect
                </span>
              </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul data-role="dropdown-list" className="grid">
                <li>
                  <NavigationMenuLink
                    asChild
                    className="flex flex-row items-center gap-2"
                  >
                    <Link
                      href="/collection/paper"
                    >
                      <Image
                        src="/images/card-w.png"
                        alt=""
                        width={12}
                        height={12}
                        className="invert-75 md:h-[15px] md:w-[15px] dark:invert-0"
                      />
                      <p className="md:text-md text-sm leading-none font-medium whitespace-nowrap">
                        Paper Collection
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    asChild
                    className="flex flex-row items-center gap-2"
                  >
                    <Link
                      href="/collection/arena"
                    >
                      <Image
                        src="/images/arena-w.png"
                        alt=""
                        width={12}
                        height={12}
                        className="invert-75 md:h-[15px] md:w-[15px] dark:invert-0"
                      />
                      <p className="md:text-md text-sm leading-none font-medium whitespace-nowrap">
                        Arena Collection
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
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
                <span data-role="link-label" className="text-xs md:text-base">
                  Wishlists
                </span>
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div
        data-role="theme-toggle-container"
        className="flex items-center md:ml-auto"
      >
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
