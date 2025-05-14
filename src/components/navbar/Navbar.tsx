'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Logo } from '../Logo';
import { UserMenu } from './UserMenu';
import { NavMenu } from './NavMenu';

const Navbar: React.FC<{}> = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav
      data-role="navbar-container"
      className="relative right-0 bottom-auto left-0 z-10 justify-start border-t-0 p-1 px-4 py-1 text-sm shadow-md hidden md:flex"
      role="navigation"
      aria-label="Main navigation"
    >
      <Link href="/" aria-label="Home">
        <Logo className="mr-4 w-15" />
      </Link>

      <NavMenu pathname={pathname} session={session} />

      <div className="ml-auto flex items-center gap-2">
        <UserMenu session={session} />
      </div>
    </nav>
  );
};

export default Navbar;
