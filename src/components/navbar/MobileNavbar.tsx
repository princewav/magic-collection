'use client';

import { cn } from '@/lib/utils';
import { Book, Heart, ListChecks } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { UserMenu } from './UserMenu';
import Image from 'next/image';

interface NavLinkProps {
  href: string;
  icon: string;
  alt?: string;
  label: string;
  onClick?: () => void;
}

interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

export default function MobileNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(
    null,
  );

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  const NavLink = ({ href, icon, alt = '', label, onClick }: NavLinkProps) => (
    <Link
      href={href}
      className="hover:bg-accent/10 focus:bg-accent/20 flex items-center gap-2 rounded-md p-3 text-sm leading-none font-medium whitespace-nowrap"
      onClick={onClick}
    >
      <Image
        src={icon}
        alt={alt}
        width={15}
        height={15}
        className="invert-75 md:h-[15px] md:w-[15px] dark:invert-0"
      />
      {label}
    </Link>
  );

  const NavButton = ({ label, icon, isActive, onClick }: NavButtonProps) => (
    <button
      className={cn(
        'flex flex-col items-center justify-center gap-1 hover:bg-accent/10 focus:bg-accent/20 transition-all duration-300',
        isActive
          ? 'bg-secondary/30 dark:bg-primary/10 dark:hover:bg-primary/20 font-semibold'
          : '',
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );

  const dropdownMenus = [
    {
      id: 'decks',
      links: [
        {
          href: '/decks/paper',
          icon: '/images/card-w.png',
          label: 'Paper Decks',
        },
        {
          href: '/decks/arena',
          icon: '/images/arena-w.png',
          label: 'Arena Decks',
        },
      ],
    },
    {
      id: 'collect',
      links: [
        {
          href: '/collection/paper',
          icon: '/images/card-w.png',
          label: 'Paper Collection',
        },
        {
          href: '/collection/arena',
          icon: '/images/arena-w.png',
          label: 'Arena Collection',
        },
      ],
    },
  ];

  return (
    <div className="md:hidden">
      {/* Dropdowns */}
      {dropdownMenus.map((menu) => (
        <div
          key={menu.id}
          className={cn(
            'bg-sidebar fixed right-0 bottom-16 left-0 z-40 overflow-hidden border-t transition-all duration-300',
            activeDropdown === menu.id ? 'max-h-32' : 'max-h-0',
          )}
        >
          <div className="space-y-1 p-2">
            {menu.links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                onClick={() => setActiveDropdown(null)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Bottom Navigation Bar */}
      <div className="bg-background fixed right-0 bottom-0 left-0 z-50 flex border-t">
        <div className="grid h-16 w-full grid-cols-3">
          <NavButton
            label="Decks"
            icon={<Book className="text-accent h-5 w-5" aria-hidden="true" />}
            isActive={pathname.includes('/decks')}
            onClick={() => toggleDropdown('decks')}
          />

          <NavButton
            label="Collect"
            icon={
              <ListChecks className="text-accent h-5 w-5" aria-hidden="true" />
            }
            isActive={
              pathname.includes('/collection')
            }
            onClick={() => toggleDropdown('collect')}
          />

          <Link
            href="/wishlists"
            className={cn(
              'flex flex-col items-center justify-center gap-1',
              pathname.includes('/wishlists')
                ? 'bg-secondary/30 dark:bg-primary/10 dark:hover:bg-primary/20 font-semibold'
                : '',
            )}
            onClick={() => setActiveDropdown(null)}
          >
            <Heart className="text-accent size-5" aria-hidden="true" />
            <span className="text-xs">Wishlists</span>
          </Link>
        </div>
        <div className="mx-3 flex items-center gap-2">
          <UserMenu session={session} />
        </div>
      </div>
    </div>
  );
}
