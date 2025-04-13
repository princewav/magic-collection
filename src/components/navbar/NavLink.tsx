'use client';

import Link from 'next/link';
import React from 'react';
import { getStyleClasses } from './NavDropdown';



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
      className={getStyleClasses(active, className)}
    >
      {children}
    </Link>
  );
};
