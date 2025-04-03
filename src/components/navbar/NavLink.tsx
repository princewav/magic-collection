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
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        // hover and focus states
        'hover:bg-accent/20',
        'hover:text-accent-foreground',
        'focus:bg-accent',
        'focus:text-accent-foreground',
        // layout and spacing
        'inline-flex w-max items-center justify-center',
        'rounded-md py-2 text-xs font-medium transition-colors',
        'focus:outline-none disabled:pointer-events-none',
        'disabled:opacity-50 md:px-4 md:text-sm',
        // flex properties
        'flex flex-col items-center gap-0.5 px-0',
        'md:flex-row md:gap-2',
        // active state
        active ? 'bg-accent/40 text-accent-foreground' : '',
        className,
      )}
    >
      {children}
    </Link>
  );
};
