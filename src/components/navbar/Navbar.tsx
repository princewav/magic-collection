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
import { usePathname } from 'next/navigation';

const NavItem = ({
  href,
  children,
  ariaLabel,
  className,  
  active,
}: {
  href: string;
  children: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  active?: boolean;
}) => {
  return (
    <NavigationMenuLink active={active} asChild>
      <Link
        href={href}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex w-max items-center justify-center rounded-md px-4 py-2 text-xs font-medium disabled:pointer-events-none disabled:opacity-50 md:px-4 md:py-2 md:text-sm',
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
        className="NavigationMenuContent absolute top-0 left-0 w-full md:relative"
        aria-label={`${label} submenu`}
      >
        {children}
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};

const DropdownList = ({ children }: { children: React.ReactNode }) => {
  return (
    <ul className="grid gap-2 p-2 md:w-[400px] md:gap-3 md:p-6 lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
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
          className="from-muted/50 to-muted flex size-full flex-col justify-end rounded-md bg-gradient-to-b p-2 no-underline outline-none select-none focus:shadow-md md:p-6"
          href={href}
        >
          <div className="mb-1 text-sm font-medium md:mb-2 md:text-lg">
            {title}
          </div>
          <p className="text-muted-foreground text-xs leading-tight md:text-sm">
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
          'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-0.5 rounded-md p-1.5 leading-none no-underline transition-colors outline-none select-none md:space-y-1 md:p-3',
          className,
          "border-l-2 border-accent rounded-l-none"
        )}
        ref={ref}
        {...props}
      >
        <div className="flex flex-row items-center space-x-1">
          <Image
            src={imageSrc}
            alt=""
            width={12}
            height={12}
            className="md:h-[15px] md:w-[15px] shadow shadow-accent/50"
          />
          <div className="text-xs leading-none font-medium md:text-sm">
            {title}
          </div>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-xs leading-snug md:text-sm">
          {children}
        </p>
      </a>
    </NavigationMenuLink>
  </li>
));
ListItem.displayName = 'ListItem';

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
      <NavigationMenu className="md:justify-start">
        <NavigationMenuList
          className="relative gap-1 md:justify-start md:gap-2"
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
              {/* <DropdownOverview
                title="Decks"
                description="Manage your Magic: The Gathering decks across formats"
                href="/decks"
                imageSrc="/images/deck-w.png"
              /> */}
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
              {/* <DropdownOverview
                title="Collection"
                description="Track your Magic cards across platforms"
                href="/collection"
                imageSrc="/images/card-w.png"
              /> */}
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
              active={pathname.includes('wishlists')}
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

        {/* <NavigationMenuViewport
          className="NavigationMenuViewport"
          aria-label="Navigation menu viewport"
        /> */}
      </NavigationMenu>
      <div className="hidden items-center md:flex">
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
