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
        'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground inline-flex w-max items-center justify-center rounded-md px-4 py-2 text-xs font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 md:px-4 md:py-2 md:text-sm',
        active ? 'bg-accent text-accent-foreground' : '',
        className,
      )}
    >
      {children}
    </Link>
  );
};
