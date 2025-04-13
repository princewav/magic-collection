'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';

type ListItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof Link>,
  'href'
> & {
  title: string;
  imageSrc: string;
  href: string;
};

export const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, title, imageSrc, href, ...props }, ref) => {
    return (
      <NavigationMenuLink asChild>
        <Link
          href={href}
          ref={ref}
          className={cn(
            'hover:bg-accent/10 hover:dark:bg-accent/20 hover:text-accent-foreground',
            'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            'block space-y-0.5 rounded-md p-2 no-underline',
            'outline-none select-none md:space-y-1 md:p-3',
            'border-accent rounded-l-none border-l-2',
            'transition-colors duration-150 ease-in-out',
            className,
          )}
          {...props}
        >
          <div className="flex flex-row items-center space-x-2 pr-3">
            <Image
              src={imageSrc}
              alt=""
              width={12}
              height={12}
              className="invert-75 md:h-[15px] md:w-[15px] dark:invert-0"
            />
            <div className="text-xs leading-none font-medium whitespace-nowrap md:text-sm">
              {title}
            </div>
          </div>
        </Link>
      </NavigationMenuLink>
    );
  },
);

ListItem.displayName = 'ListItem';
