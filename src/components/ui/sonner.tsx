'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

export const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  const commonToastOptions = {
    classNames: {
      toast: 'group toast group-[.toaster]:border-border group-[.toaster]:shadow-lg',
      description: 'group-[.toast]:text-muted-foreground',
      actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium',
      cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium',
      success: '!bg-green-900/60 !text-white',
      error: '!bg-red-900/60 !text-white',
    },
  };
  const position = "bottom-right"
  const offset = 68

  return (
    <>
      {/* Mobile Toaster */}
      <Sonner
        theme={theme as ToasterProps['theme']}
        className="toaster group block md:hidden" // Show only on mobile
        position={position} // Position for mobile
        offset={offset} // Add offset for mobile
        mobileOffset={offset} // override default offset for mobile
        toastOptions={commonToastOptions}
        {...props}
      />
      {/* Desktop Toaster */}
      <Sonner
        theme={theme as ToasterProps['theme']}
        className="toaster group hidden md:block" // Show only on desktop
        position={position} // Position for desktop
        toastOptions={commonToastOptions}
        {...props}
      />
    </>
  );
};
