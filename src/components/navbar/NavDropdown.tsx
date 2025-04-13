'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';

// --- Define animation durations ---
const ANIMATION_DURATION = 100; // ms - Match this with Tailwind duration class

export function getStyleClasses(
  active: boolean | undefined,
  className: string | undefined,
) {
  return cn(
    // hover and focus states
    'hover:bg-accent/10',
    'focus:bg-accent/20',
    // layout and spacing
    'inline-flex w-max items-center justify-center',
    'rounded-md py-1 text-xs font-medium transition-colors',
    'focus:outline-none disabled:pointer-events-none',
    'px-4 disabled:opacity-50 md:text-sm',
    // flex properties
    'flex flex-col items-center gap-0.5',
    'md:flex-row md:gap-2',
    // active state
    active
      ? 'bg-secondary/30 dark:bg-primary/10 dark:hover:bg-primary/20 font-semibold'
      : '',
    className,
  );
}

export const NavDropdown = ({
  triggerContent,
  children,
  label,
  className,
  active,
}: {
  triggerContent: React.ReactNode;
  children: React.ReactNode;
  label: string;
  className?: string;
  active?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // State to control actual rendering in the DOM, allowing time for exit animation
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to manage rendering based on isOpen state and animation timing
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (isOpen) {
      setShouldRender(true); // If opening, render immediately
    } else if (shouldRender) {
      // If closing and still rendered, start timer to unmount after animation
      timerId = setTimeout(() => {
        setShouldRender(false);
      }, ANIMATION_DURATION); // Wait for animation to finish
    }

    // Cleanup function to clear timeout if component unmounts or isOpen changes again
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isOpen, shouldRender]); // Depend on both isOpen and shouldRender

  // --- Mouse/Focus Handlers (with slight adjustments for timing) ---

  const clearCloseTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearCloseTimeout();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100); // Slightly shorter delay before starting close sequence
  };

  const handleDropdownMouseEnter = () => {
    clearCloseTimeout(); // Keep open if mouse moves onto dropdown
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const handleFocus = () => {
    clearCloseTimeout();
    setIsOpen(true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // Check if the focus is moving outside the entire component
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 50); // Very short delay on blur
    }
  };

  useEffect(() => {
    // Global cleanup for the close timer on unmount
    return () => {
      clearCloseTimeout();
    };
  }, []);

  return (
    <div
      className={cn('group relative flex items-center', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
    >
      <button
        type="button"
        className={getStyleClasses(active, className)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`${label} menu`}
      >
        {triggerContent}
      </button>

      {/* Use shouldRender to control DOM presence */}
      {shouldRender && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute left-1/2 z-20 w-auto md:left-0',
            'bottom-full mb-2', // Default (mobile): Opens upwards
            '-translate-x-1/2 md:top-full md:bottom-auto md:mt-0 md:translate-x-0', // Medium screens and up: Opens downwards & centered
            'origin-bottom-left md:origin-top-left', // Adjust origin based on direction
            {
              [`animate-in fade-in-0 zoom-in-95 duration-${ANIMATION_DURATION} ease-out`]:
                isOpen,
              [`animate-out fade-out-0 zoom-out-95 duration-${ANIMATION_DURATION} ease-in`]:
                !isOpen,
            },
          )}
          aria-label={`${label} submenu`}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <div className="bg-popover text-popover-foreground overflow-hidden rounded-md border shadow-lg">
            <ul className="grid gap-1 p-2 md:p-3">{children}</ul>
          </div>
        </div>
      )}
    </div>
  );
};
