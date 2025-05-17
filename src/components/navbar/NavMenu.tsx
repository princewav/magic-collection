'use client';

import { cn } from '@/lib/utils';
import { Book, Heart, ListChecks } from 'lucide-react';
import { Session } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { TbCards, TbCardsFilled } from 'react-icons/tb';
import { MdCollectionsBookmark, MdOutlineCollectionsBookmark } from 'react-icons/md';
import { FaHeart, FaRegHeart } from 'react-icons/fa';


type AnimatedDropdownProps = {
  trigger: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  content: React.ReactNode;
  align?: 'left' | 'right' | 'center';
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
  leaveDelay = 0,
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
      }, 150);
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
      className="relative flex items-center"
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
        className="relative flex h-full cursor-pointer items-center"
      >
        {triggerElement}
        <div
          className={cn(
            'h-fullease-out bg-primary absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full transition-all duration-300',
            isHoveringTriggerArea || isOpen
              ? 'w-1/2 opacity-100'
              : 'w-0 opacity-0',
          )}
        />
      </div>
      <div
        className={cn(
          'absolute top-full z-50 mt-1 min-w-[220px]',
          align === 'left'
            ? 'left-0'
            : align === 'right'
              ? 'right-0'
              : 'left-1/2 -translate-x-1/2',
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
            'bg-background/80 overflow-hidden rounded-md border shadow-lg backdrop-blur-lg',
            isOpen
              ? align === 'right'
                ? 'animate-slide-in-right'
                : 'animate-slide-in-left'
              : align === 'right'
                ? 'animate-slide-out-right'
                : 'animate-slide-out-left',
          )}
          style={{
            transformOrigin: align === 'right' ? 'top right' : 'top left',
            animation: isOpen
              ? align === 'right'
                ? 'var(--animate-slide-in-right)'
                : 'var(--animate-slide-in-left)'
              : align === 'right'
                ? 'var(--animate-slide-out-right)'
                : 'var(--animate-slide-out-left)',
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
    <div className="flex justify-around py-1 md:justify-start md:gap-2">
      {session && (
        <>
          <AnimatedDropdown
            trigger={(isOpen) => (
              <Button
                variant="ghost"
                className={cn(
                  'flex h-full items-center gap-2 rounded-md px-4 py-1 text-sm shadow-none transition-colors duration-200 focus:outline-none',
                  pathname.includes('/decks') &&
                    'bg-secondary/50 hover:bg-secondary/70',
                )}
              >
                {pathname.includes('/decks') ? (
                  <TbCardsFilled className="text-accent h-6 w-6" />
                ) : (
                  <TbCards className="text-accent h-6 w-6" />
                )}
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
              </Button>
            )}
            content={
              <div className="w-[230px] py-1">
                <div className="text-muted-foreground border-b px-3 py-1 text-xs">
                  Manage your decks
                </div>
                <ul className="py-1">
                  <li>
                    <Link
                      href="/decks/paper"
                      className="hover:bg-secondary/20 flex items-center gap-2 px-4 py-2 transition-colors duration-150 focus:outline-none"
                    >
                      <Image
                        src="/images/card-w.png"
                        alt="Paper Collection"
                        width={20}
                        height={20}
                        className="invert dark:invert-0"
                      />
                      <div>
                        <div className="text-sm font-medium">Paper Decks</div>
                        <div className="text-muted-foreground text-xs">
                          Physical card collections
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/decks/arena"
                      className="hover:bg-secondary/20 flex items-center gap-2 px-4 py-2 transition-colors duration-150 focus:outline-none"
                    >
                      <Image
                        src="/images/arena-w.png"
                        alt="Arena Collection"
                        width={20}
                        height={20}
                        className="invert dark:invert-0"
                      />
                      <div>
                        <div className="text-sm font-medium">Arena Decks</div>
                        <div className="text-muted-foreground text-xs">
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
              <Button
                variant="ghost"
                className={cn(
                  'flex h-full items-center gap-2 rounded-md px-4 py-1 text-sm shadow-none transition-colors duration-200 focus:outline-none',
                  pathname.includes('/collection') &&
                    'bg-secondary/50 hover:bg-secondary/70',
                )}
              >
                {pathname.includes('/collection') ? (
                  <MdCollectionsBookmark className="text-accent h-6 w-6" />
                ) : (
                  <MdOutlineCollectionsBookmark className="text-accent h-6 w-6" />
                )}
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
              </Button>
            )}
            content={
              <div className="w-[230px] py-1">
                <div className="text-muted-foreground border-b px-3 py-1 text-xs">
                  Manage your collection
                </div>
                <ul className="py-1">
                  <li>
                    <Link
                      href="/collection/paper"
                      className="hover:bg-secondary/20 flex items-center gap-2 px-4 py-2 transition-colors duration-150 focus:outline-none"
                    >
                      <Image
                        src="/images/card-w.png"
                        alt="Paper Collection"
                        width={20}
                        height={20}
                        className="invert dark:invert-0"
                      />
                      <div>
                        <div className="text-sm font-medium">
                          Paper Collection
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Physical cards
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collection/arena"
                      className="hover:bg-secondary/20 flex items-center gap-2 px-4 py-2 transition-colors duration-150 focus:outline-none"
                    >
                      <Image
                        src="/images/arena-w.png"
                        alt="Arena Collection"
                        width={20}
                        height={20}
                        className="invert dark:invert-0"
                      />
                      <div>
                        <div className="text-sm font-medium">
                          Arena Collection
                        </div>
                        <div className="text-muted-foreground text-xs">
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
              'group hover:bg-secondary/50 relative flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors duration-200 focus:outline-none',
              pathname.includes('/wishlists') &&
                'bg-secondary/50 hover:bg-secondary/70',
            )}
          >
            {pathname.includes('/wishlists') ? (
              <FaHeart className="text-accent h-4 w-4" />
            ) : (
              <FaRegHeart className="text-accent h-4 w-4" />
            )}
            <span>Wishlists</span>
            <div className="bg-accent absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full transition-all duration-300 ease-out group-hover:w-1/2" />
          </Link>
        </>
      )}
    </div>
  );
}
