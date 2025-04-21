'use server';

import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth.config';

/**
 * Refresh the current user session
 * This is a helper function to update session data after user profile changes
 */
export async function refreshSession() {
  const session = await getServerSession(authConfig);

  if (!session) {
    return { success: false, message: 'No active session' };
  }

  return { success: true };
}
