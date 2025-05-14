'use client';

import { LogOut, Settings, User, Star } from 'lucide-react';
import { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  session: Session | null;
}

export function UserMenu({ session: initialSession }: UserMenuProps) {
  // Use useSession with default behavior
  const { data: updatedSession } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use the most up-to-date session
  const session = updatedSession || initialSession;

  // Fallback for when not authenticated
  if (!session) {
    return (
      <Link href="/auth/login">
        <Button variant="ghost" size="sm">
          Sign in
        </Button>
      </Link>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  // Handle opening the dropdown
  const handleMouseEnter = () => {
    setIsHovering(true);

    // Clear any existing leave timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }

    // Clear any visibility timeout that might hide the element
    if (visibilityTimeoutRef.current) {
      clearTimeout(visibilityTimeoutRef.current);
      visibilityTimeoutRef.current = null;
    }

    // Set dropdown to visible immediately to prevent flickering
    if (!isOpen) {
      setIsVisible(true);
      // Small delay for better transition
      enterTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, 50);
    }
  };

  // Handle closing the dropdown
  const handleMouseLeave = () => {
    setIsHovering(false);

    // Clear any existing enter timeout
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }

    // Start closing animation first
    leaveTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);

      // Only hide the element after animation completes
      visibilityTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match animation duration
    }, 150);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        variant="outline"
        className="relative rounded-full border-2 bg-slate-800 transition-colors duration-200 hover:bg-slate-700"
        size="icon"
      >
        <Avatar>
          <AvatarImage
            src={session.user?.image || ''}
            alt={session.user?.name || 'User avatar'}
          />
          <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
        </Avatar>
      </Button>

      <div
        className="absolute top-full right-0 z-50 mt-1 min-w-[220px] overflow-hidden"
        style={{
          visibility: isVisible ? 'visible' : 'hidden',
          pointerEvents: isOpen ? 'auto' : 'none',
          opacity: isVisible ? 1 : 0, // Add opacity transition at container level
          transition: 'opacity 0.05s ease', // Quick fade in to avoid flickering
        }}
      >
        <div
          className={cn(
            'w-56 overflow-hidden rounded-md border border-slate-700 bg-slate-900/95 shadow-lg backdrop-blur-sm',
            isOpen ? 'animate-slide-in-right' : 'animate-slide-out-right',
          )}
          style={{
            transformOrigin: 'top right',
            animation: isOpen
              ? 'var(--animate-slide-in-right)'
              : 'var(--animate-slide-out-right)',
          }}
        >
          <div className="border-b border-slate-700/50 font-normal">
            <div className="flex flex-col space-y-1 px-3 py-2">
              <p className="text-sm leading-none font-medium">
                {session.user?.name}
              </p>
              <p className="text-muted-foreground text-xs leading-none">
                {session.user?.email}
              </p>
            </div>
          </div>
          <ul className="py-1">
            <li>
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 transition-colors duration-150 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className="flex items-center px-4 py-2 transition-colors duration-150 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </li>
            <li className="mt-1 border-t border-slate-700/50">
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signout' })}
                className="text-destructive flex w-full items-center px-4 py-2 transition-colors duration-150 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
