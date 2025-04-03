'use client';

import { Home, Book, ListChecks, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import './Navbar.css';
import { Logo } from '../Logo';
import { ThemeToggle } from '../theme/ThemeToggle';
import { usePathname } from 'next/navigation';
import {NavDropdown} from './NavDropdown';
import {ListItem} from './NavListItem';
import {NavLink} from './NavLink';




const Navbar: React.FC<{}> = () => {
  const pathname = usePathname();

  const elementCLS =
    'flex flex-col items-center !px-0 gap-0.5 md:flex-row md:gap-2';
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
            <div className={elementCLS}>
              <Book className="text-accent h-5 w-5" aria-hidden="true" />
              <span className="text-xs md:text-base">Decks</span>
            </div>
          }
        >
          <ListItem
            href="/decks/paper"
            title="Paper Decks"
            imageSrc="/images/card-w.png"
          >
            Manage your physical Magic: The Gathering decks
          </ListItem>
          <ListItem
            href="/decks/arena"
            title="Arena Decks"
            imageSrc="/images/arena-w.png"
          >
            Organize and track your MTG Arena decks
          </ListItem>
        </NavDropdown>

        <NavDropdown
          label="Collection"
          className="bg-sidebar"
          triggerContent={
            <div className={elementCLS}>
              <ListChecks className="text-accent h-5 w-5" aria-hidden="true" />
              <span className="text-xs md:text-base">Collect</span>
            </div>
          }
        >
          <ListItem
            href="/collection/paper"
            title="Paper Collection"
            imageSrc="/images/card-w.png"
          >
            Catalog your physical Magic cards
          </ListItem>
          <ListItem
            href="/collection/arena"
            title="Arena Collection"
            imageSrc="/images/arena-w.png"
          >
            Track your MTG Arena card collection
          </ListItem>
        </NavDropdown>

        <NavLink
          active={pathname === '/wishlists'}
          href="/wishlists"
          ariaLabel="Wishlists"
          className="bg-sidebar"
        >
          <div className={elementCLS}>
            <Heart className="text-accent size-5" aria-hidden="true" />
            <span className="text-xs md:text-base">Wishlists</span>
          </div>
        </NavLink>
      </div>
      <div className="hidden items-center md:flex">
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
