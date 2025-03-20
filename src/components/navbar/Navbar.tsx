'use client';

import { Home, Book, ListChecks, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import React from 'react';
import './Navbar.css';
import { Logo } from '../Logo';
import { ThemeToggle } from '../theme/ThemeToggle';

const NavItem = ({
  href,
  children,
  ariaLabel,
  className,
}: {
  href: string;
  children: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}) => {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        aria-label={ariaLabel}
        className={cn(
          'bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground inline-flex w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
      >
        {children}
      </Link>
    </NavigationMenuLink>
  );
};

const NavDropdown = ({
  triggerContent,
  children,
  label,
  className,
}: {
  triggerContent: React.ReactNode;
  children: React.ReactNode;
  label: string;
  className?: string;
}) => {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn('group', className)}
        aria-label={`${label} menu`}
      >
        {triggerContent}
      </NavigationMenuTrigger>
      <NavigationMenuContent
        className="NavigationMenuContent absolute top-0 left-0 w-full"
        aria-label={`${label} submenu`}
      >
        {children}
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};

const DropdownList = ({ children }: { children: React.ReactNode }) => {
  return (
    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
      {children}
    </ul>
  );
};

const DropdownOverview = ({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
  imageSrc?: string;
}) => {
  return (
    <li className="row-span-2">
      <NavigationMenuLink asChild>
        <a
          className="from-muted/50 to-muted flex size-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none select-none focus:shadow-md"
          href={href}
        >
          <div className="mb-2 text-lg font-medium">{title}</div>
          <p className="text-muted-foreground text-sm leading-tight">
            {description}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
};

const ListItem = React.forwardRef<
  React.ComponentRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & {
    title: string;
    imageSrc: string;
    children?: React.ReactNode;
  }
>(({ className, title, imageSrc, children, ...props }, ref) => (
  <li>
    <NavigationMenuLink asChild>
      <a
        className={cn(
          'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none',
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="flex flex-row items-center space-x-1">
          <Image src={imageSrc} alt="" width={15} height={15} />
          <div className="text-sm leading-none font-medium">{title}</div>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
          {children}
        </p>
      </a>
    </NavigationMenuLink>
  </li>
));
ListItem.displayName = 'ListItem';

const Navbar: React.FC<{}> = () => {
  const elementCLS =
    'flex flex-col items-center !px-0 md:flex-row md:space-x-2';
  return (
    <nav
      className="bg-sidebar fixed right-0 bottom-0 left-0 z-10 flex border-t px-4 py-1 text-sm shadow-md md:relative md:bottom-auto md:border-t-0 md:py-2"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mr-4 py-1 text-2xl font-bold md:block md:py-0">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
      </div>
      <NavigationMenu className="md:justify-start">
        <NavigationMenuList
          className="relative gap-2 md:justify-start"
          role="menubar"
          aria-label="Main menu"
        >
          {/* Decks Menu */}
          <NavDropdown
            label="Decks"
            className="bg-sidebar"
            triggerContent={
              <div className={elementCLS}>
                <Book className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs md:text-base">Decks</span>
              </div>
            }
          >
            <DropdownList>
              <DropdownOverview
                title="Decks"
                description="Manage your Magic: The Gathering decks across formats"
                href="/decks"
                imageSrc="/images/deck-w.png"
              />
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
            </DropdownList>
          </NavDropdown>

          {/* Collection Menu */}
          <NavDropdown
            label="Collection"
            className="bg-sidebar"
            triggerContent={
              <div className={elementCLS}>
                <ListChecks className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs md:text-base">Collect</span>
              </div>
            }
          >
            <DropdownList>
              <DropdownOverview
                title="Collection"
                description="Track your Magic cards across platforms"
                href="/collection"
                imageSrc="/images/card-w.png"
              />
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
            </DropdownList>
          </NavDropdown>

          {/* Wishlist */}
          <NavigationMenuItem>
            <NavItem
              href="/wishlists"
              ariaLabel="Wishlists"
              className="bg-sidebar"
            >
              <div className={elementCLS}>
                <Heart className="text-foreground size-5" aria-hidden="true" />
                <span className="text-xs md:text-base">Wishlists</span>
              </div>
            </NavItem>
          </NavigationMenuItem>
        </NavigationMenuList>

        <NavigationMenuViewport
          className="NavigationMenuViewport"
          aria-label="Navigation menu viewport"
        />
      </NavigationMenu>
      <div className="hidden md:block">
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
