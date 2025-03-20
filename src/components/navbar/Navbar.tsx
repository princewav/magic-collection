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
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className={cn(
          'bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50',
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
}: {
  triggerContent: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="group">
        {triggerContent}
      </NavigationMenuTrigger>
      <NavigationMenuContent className="NavigationMenuContent absolute top-0 left-0 w-full">
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
  return (
    <nav className="px-4 py-2 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4 text-2xl font-bold">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <NavigationMenu>
            <NavigationMenuList className="relative">
              {/* Decks Menu */}
              <NavDropdown
                triggerContent={
                  <div className="flex flex-row space-x-2">
                    <Book className="h-5 w-5" />
                    <span>Decks</span>
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
                triggerContent={
                  <div className="flex flex-row space-x-2">
                    <ListChecks className="h-5 w-5" />
                    <span>Collection</span>
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
                <NavItem href="/wishlists">
                  <div className="flex flex-row items-center space-x-2">
                    <Heart className="!h-5 !w-5"/>
                    <span>Wishlists</span>
                  </div>
                </NavItem>
              </NavigationMenuItem>
            </NavigationMenuList>

            <NavigationMenuViewport className="NavigationMenuViewport" />
          </NavigationMenu>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
