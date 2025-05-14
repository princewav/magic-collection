'use client';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Book, Heart, ListChecks } from 'lucide-react';
import { Session } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type AnimatedDropdownProps = {
  trigger: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  content: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  hoverDelay?: number;
  leaveDelay?: number;
};

const AnimatedDropdown = ({
  trigger,
  content,
  align = 'left',
  className,
  hoverDelay = 150,
  leaveDelay = 50,
}: AnimatedDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringTriggerArea, setIsHoveringTriggerArea] = useState(false);

  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setIsVisible(true);
    } else {
      hideTimeoutRef.current = setTimeout(() => {
        if (!isOpenRef.current) {
          setIsVisible(false);
        }
      }, 300);
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    setIsHoveringTriggerArea(true);
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }

    if (!isOpen) {
      enterTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, hoverDelay);
    }
  };

  const handleMouseLeave = () => {
    setIsHoveringTriggerArea(false);
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, leaveDelay);
  };

  const handleClick = () => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }

    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) {
        clearTimeout(enterTimeoutRef.current);
        enterTimeoutRef.current = null;
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  const triggerElement =
    typeof trigger === 'function' ? trigger(isOpen) : trigger;

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="relative cursor-pointer"
      >
        {triggerElement}
        <div
          className={cn(
            'absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-blue-400 transition-all duration-300 ease-out',
            isHoveringTriggerArea || isOpen
              ? 'w-1/2 opacity-100'
              : 'w-0 opacity-0',
          )}
        />
      </div>
      <div
        className={cn(
          'absolute top-full z-50 mt-1 min-w-[220px]',
          align === 'left' ? 'left-0' : 'right-0',
          className,
        )}
        style={{
          display: isVisible ? 'block' : 'none',
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
        role="menu"
        aria-orientation="vertical"
      >
        <div
          className={cn(
            'overflow-hidden rounded-md border border-slate-700 bg-slate-900/95 shadow-lg backdrop-blur-sm',
            isOpen
              ? align === 'left'
                ? 'animate-slide-in-left'
                : 'animate-slide-in-right'
              : align === 'left'
                ? 'animate-slide-out-left'
                : 'animate-slide-out-right',
          )}
          style={{
            transformOrigin: align === 'left' ? 'top left' : 'top right',
            animation: isOpen
              ? align === 'left'
                ? 'var(--animate-slide-in-left)'
                : 'var(--animate-slide-in-right)'
              : align === 'left'
                ? 'var(--animate-slide-out-left)'
                : 'var(--animate-slide-out-right)',
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
};

export function NavMenu({
  pathname,
  session,
}: {
  pathname: string;
  session: Session | null;
}) {
  return (
    <div className="flex justify-around md:justify-start md:gap-2">
      {session && (
        <>
          <AnimatedDropdown
            trigger={(isOpen) => (
              <button
                className={cn(
                  'flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors duration-200 focus:outline-none',
                  pathname.includes('/decks')
                    ? 'bg-slate-800 hover:bg-slate-700/90'
                    : 'hover:bg-slate-800/70 focus:bg-slate-800',
                )}
              >
                <Book className="h-4 w-4" />
                <span>Decks</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    'ml-1 h-4 w-4 transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            )}
            content={
              <div className="w-[230px] py-1">
                <div className="border-b border-slate-700/50 px-3 py-2 text-xs text-slate-400">
                  Select a deck type
                </div>
                <ul className="py-1">
                  <li>
                    <Link
                      href="/decks/paper"
                      className="flex items-center gap-2 px-4 py-2 transition-colors duration-150 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
                    >
                      <span className="text-base">📄</span>
                      <div>
                        <div className="text-sm font-medium">Paper Decks</div>
                        <div className="text-xs text-slate-400">
                          Physical card collections
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/decks/arena"
                      className="flex items-center gap-2 px-4 py-2 transition-colors duration-150 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
                    >
                      <span className="text-base">🎮</span>
                      <div>
                        <div className="text-sm font-medium">Arena Decks</div>
                        <div className="text-xs text-slate-400">
                          Digital card collections
                        </div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>
            }
            align="left"
            hoverDelay={150}
            leaveDelay={50}
          />

          <AnimatedDropdown
            trigger={(isOpen) => (
              <button
                className={cn(
                  'flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors duration-200 focus:outline-none',
                  pathname.includes('/collection')
                    ? 'bg-slate-800 hover:bg-slate-700/90'
                    : 'hover:bg-slate-800/70 focus:bg-slate-800',
                )}
              >
                <ListChecks className="h-4 w-4 text-amber-500" />
                <span>Collect</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    'ml-1 h-4 w-4 transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            )}
            content={
              <div className="w-[230px] py-1">
                <div className="border-b border-slate-700/50 px-3 py-2 text-xs text-slate-400">
                  Manage your collection
                </div>
                <ul className="py-1">
                  <li>
                    <Link
                      href="/collection/paper"
                      className="flex items-center gap-2 px-4 py-2 transition-colors duration-150 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
                    >
                      <span className="text-base">📄</span>
                      <div>
                        <div className="text-sm font-medium">
                          Paper Collection
                        </div>
                        <div className="text-xs text-slate-400">
                          Physical cards
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collection/arena"
                      className="flex items-center gap-2 px-4 py-2 transition-colors duration-150 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
                    >
                      <span className="text-base">🎮</span>
                      <div>
                        <div className="text-sm font-medium">
                          Arena Collection
                        </div>
                        <div className="text-xs text-slate-400">
                          Digital cards
                        </div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>
            }
            align="left"
            hoverDelay={150}
            leaveDelay={20}
          />

          <Link
            href="/wishlists"
            className={cn(
              'group relative flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors duration-200 focus:outline-none',
              pathname.includes('/wishlists')
                ? 'bg-slate-800 hover:bg-slate-700/70'
                : 'hover:bg-slate-800/70 focus:bg-slate-800',
            )}
          >
            <Heart className="h-4 w-4 text-rose-500" />
            <span>Wishlists</span>
            <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-rose-500 transition-all duration-300 ease-out group-hover:w-1/2" />
          </Link>
        </>
      )}
    </div>
  );
}
