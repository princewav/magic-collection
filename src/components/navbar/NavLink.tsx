'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

export const NavLink = ({
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
  console.log(active);

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        // hover and focus states
        'hover:bg-accent/20',
        'focus:bg-accent/40',
        // layout and spacing
        'inline-flex w-max items-center justify-center',
        'rounded-md py-2 text-xs font-medium transition-colors',
        'focus:outline-none disabled:pointer-events-none',
        'px-4 disabled:opacity-50 md:text-sm',
        // flex properties
        'flex flex-col items-center gap-0.5',
        'md:flex-row md:gap-2',
        // active state
        active
          ? 'bg-secondary/40 dark:bg-primary/30 dark:hover:bg-primary/40 font-semibold'
          : '',
        className,
      )}
    >
      {children}
    </Link>
  );
};
