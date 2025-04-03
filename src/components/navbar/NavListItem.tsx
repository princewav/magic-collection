'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export const ListItem = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & {
    title: string;
    imageSrc: string;
    children: React.ReactNode;
    href: string;
  }
>(({ className, title, imageSrc, children, href, ...props }, ref) => {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          // hover and focus states
          'hover:bg-accent/10 hover:dark:bg-accent/20 hover:text-accent-foreground',
          'focus:bg-accent focus:text-accent-foreground',
          // layout and spacing
          'block space-y-0.5 rounded-md p-1.5 leading-none no-underline',
          'transition-colors outline-none select-none md:space-y-1 md:p-3',
          // border styles
          'border-accent rounded-l-none border-l-2',
          'transition-all duration-300 ease-in-out',
          className,
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
            className="invert-75 md:h-[15px] md:w-[15px] dark:invert-0"
          />
          <div className="text-xs leading-none font-medium md:text-sm">
            {title}
          </div>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-xs leading-snug md:text-sm">
          {children}
        </p>
      </Link>
    </li>
  );
});
// Specifying the displayName helps with debugging and improves the readability of the component in React DevTools.
ListItem.displayName = 'ListItem';
