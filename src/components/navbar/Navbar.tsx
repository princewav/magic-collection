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
      className="bg-sidebar fixed right-0 bottom-0 left-0 z-10 flex justify-between border-t p-1 px-4 text-xs shadow-md md:relative md:bottom-auto md:justify-start md:border-t-0 md:px-4 md:py-1 md:text-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <Link href="/" aria-label="Home">
        <Logo className="w-15 md:mr-4" />
      </Link>

      <NavMenu pathname={pathname} session={session} />

      <div className="flex items-center gap-2 md:ml-auto">
        <UserMenu session={session} />
      </div>
    </nav>
  );
};

export default Navbar;


