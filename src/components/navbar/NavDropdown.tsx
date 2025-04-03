'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';

export const NavDropdown = ({
  triggerContent,
  children,
  label,
  className,
}: {
  triggerContent: React.ReactNode;
  children: React.ReactNode;
  label: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleFocus = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 150);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn('group relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <button
        type="button"
        className={cn(
          'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground inline-flex w-max items-center justify-center rounded-md px-4 py-2 text-xs font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 md:px-4 md:py-2 md:text-sm',
          className,
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`${label} menu`}
      >
        {triggerContent}
      </button>
      {isOpen && (
        <div
          className="absolute top-full left-0 z-20 mt-1 w-auto md:mt-2"
          aria-label={`${label} submenu`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-popover text-popover-foreground overflow-hidden rounded-md border shadow-lg">
            <ul className="grid gap-2 p-2 md:w-[400px] md:gap-3 md:p-6 lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              {children}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
