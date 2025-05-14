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
      className="hover:bg-secondary/30 focus:bg-accent/20 flex items-center gap-2 rounded-md p-3 text-sm leading-none font-medium whitespace-nowrap"
      onClick={onClick}
    >
      <Image
        src={icon}
        alt={alt}
        width={15}
        height={15}
        className="md:h-[15px] md:w-[15px]"
      />
      {label}
    </Link>
  );

  const NavButton = ({ label, icon, isActive, onClick }: NavButtonProps) => (
    <button
      className={cn(
        'hover:bg-secondary/30 focus:bg-accent/20 py-2 duration-300 flex flex-col items-center justify-center gap-1 transition-all',
        isActive
          ? 'bg-secondary/30 hover:bg-secondary/50 dark:bg-primary/10 dark:hover:bg-primary/20 font-semibold transition-all duration-300'
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
          icon: '/images/card-accent.png',
          label: 'Paper Decks',
        },
        {
          href: '/decks/arena',
          icon: '/images/arena-accent.png',
          label: 'Arena Decks',
        },
      ],
    },
    {
      id: 'collect',
      links: [
        {
          href: '/collection/paper',
          icon: '/images/card-accent.png',
          label: 'Paper Collection',
        },
        {
          href: '/collection/arena',
          icon: '/images/arena-accent.png',
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
            'bg-sidebar fixed right-0 bottom-6 left-0 z-40 h-0 overflow-hidden border-t transition-all duration-300',
            activeDropdown === menu.id ? 'h-32' : 'max-h-0',
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
        <div className="grid w-full grid-cols-3">
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
            isActive={pathname.includes('/collection')}
            onClick={() => toggleDropdown('collect')}
          />

          <Link
            href="/wishlists"
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2',
              pathname.includes('/wishlists')
                ? 'bg-secondary/30 hover:bg-secondary/50 dark:bg-primary/10 dark:hover:bg-primary/20 font-semibold transition-all duration-300'
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
