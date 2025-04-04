'use client';

import { Book, Heart, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Logo } from '../Logo';
import { ThemeToggle } from '../theme/ThemeToggle';
import { NavDropdown } from './NavDropdown';
import { NavLink } from './NavLink';
import { ListItem } from './NavListItem';

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
      <div className="flex flex-grow justify-around md:justify-start md:gap-2">
        <NavDropdown
          label="Decks"
          className="bg-sidebar"
          triggerContent={
            <>
              <Book className="text-accent h-5 w-5" aria-hidden="true" />
              <span className="text-xs md:text-base">Decks</span>
            </>
          }
        >
          <ListItem
            href="/decks/paper"
            title="Paper Decks"
            imageSrc="/images/card-w.png"
          >
          </ListItem>
          <ListItem
            href="/decks/arena"
            title="Arena Decks"
            imageSrc="/images/arena-w.png"
          >
          </ListItem>
        </NavDropdown>

        <NavDropdown
          label="Collection"
          className="bg-sidebar"
          triggerContent={
            <>
              <ListChecks className="text-accent h-5 w-5" aria-hidden="true" />
              <span className="text-xs md:text-base">Collect</span>
            </>
          }
        >
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
        </NavDropdown>

        <NavLink
          active={pathname === '/wishlists'}
          href="/wishlists"
          ariaLabel="Wishlists"
          className="bg-sidebar"
        >
          <Heart className="text-accent size-5" aria-hidden="true" />
          <span className="text-xs md:text-base">Wishlists</span>
        </NavLink>
      </div>
      <div className="hidden items-center md:flex">
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
