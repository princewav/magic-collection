'use client';

import { LogOut, Settings, User } from 'lucide-react';
import { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface UserMenuProps {
  session: Session | null;
}

export function UserMenu({ session: initialSession }: UserMenuProps) {
  // Use useSession with default behavior
  const { data: updatedSession, status } = useSession();

  // Use the most up-to-date session
  const session = updatedSession || initialSession;

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex h-8 w-8 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Fallback for when not authenticated
  if (!session) {
    return (
      <Link href="/auth/login">
        <Button size="sm">
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session.user?.image || ''}
              alt={session.user?.name || 'User avatar'}
            />
            <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-background/80 w-56 backdrop-blur-md"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {session.user?.name}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/auth/signout' })}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
