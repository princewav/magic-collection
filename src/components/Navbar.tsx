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

interface NavbarProps {}

const ListItem = React.forwardRef<
  React.ComponentRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => (
  <li>
    <NavigationMenuLink asChild>
      <a
        className={cn(
          'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className='text-sm font-medium leading-none'>{title}</div>
        <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
          {children}
        </p>
      </a>
    </NavigationMenuLink>
  </li>
));
ListItem.displayName = 'ListItem';

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <nav className="p-4 shadow-md">
      <div className="container flex items-center">
        <div className="mr-4 text-2xl font-bold">Magic Collection</div>
        <NavigationMenu>
          <NavigationMenuList className='relative'>
            {/* Browse */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/"
                  className={cn(
                    'inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50'
                  )}
                >
                  <Home className="h-5 w-5" />
                  <span>Browse</span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Decks Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className='group'>
                <Book className="h-5 w-5" />
                <span>Decks</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent className='NavigationMenuContent absolute left-0 top-0 w-full'>
                <ul className='grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]'>
                  <li className='row-span-2'>
                    <NavigationMenuLink asChild>
                      <a
                        className='flex size-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md'
                        href='/decks'
                      >
                        <div className='mb-2 text-lg font-medium'>Decks</div>
                        <p className='text-sm leading-tight text-muted-foreground'>
                          Manage your Magic: The Gathering decks across formats
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href='/decks/paper' title='Paper Decks'>
                    Manage your physical Magic: The Gathering decks
                  </ListItem>
                  <ListItem href='/decks/arena' title='Arena Decks'>
                    Organize and track your MTG Arena decks
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Collection Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className='group'>
                <ListChecks className="h-5 w-5" />
                <span>Collection</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent className='NavigationMenuContent absolute left-0 top-0 w-full'>
                <ul className='grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]'>
                  <li className='row-span-2'>
                    <NavigationMenuLink asChild>
                      <a
                        className='flex size-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md'
                        href='/collection'
                      >
                        <div className='mb-2 text-lg font-medium'>Collection</div>
                        <p className='text-sm leading-tight text-muted-foreground'>
                          Track your Magic cards across platforms
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href='/collection/paper' title='Paper Collection'>
                    Catalog your physical Magic cards
                  </ListItem>
                  <ListItem href='/collection/arena' title='Arena Collection'>
                    Track your MTG Arena card collection
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Wishlist */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/wishlists"
                  className={cn(
                    'inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50'
                  )}
                >
                  <Heart className="h-5 w-5" />
                  <span>Wishlists</span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>

          <NavigationMenuViewport className='NavigationMenuViewport' />
        </NavigationMenu>
      </div>
    </nav>
  );
};

export default Navbar;
