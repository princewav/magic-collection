import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/db/services/UserService';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/auth.config';
import { providers } from '@/auth/providers';

export async function GET(req: NextRequest) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession({
      ...authConfig,
      providers,
    });

    // User must be authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user profile
    const userProfile = await userService.findById(userId);
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if detailed stats are requested
    const includeStats =
      req.nextUrl.searchParams.get('include_stats') === 'true';

    if (includeStats) {
      const stats = await userService.getUserStats(userId);
      return NextResponse.json({
        user: userProfile,
        stats,
      });
    }

    // Return just the user profile if stats not requested
    return NextResponse.json({ user: userProfile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
