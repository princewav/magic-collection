import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/db/services/UserService';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/auth.config';
import { providers } from '@/auth/providers';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession({
      ...authConfig,
      providers,
    });

    // User must be authenticated and requesting their own wishlists
    if (!session || !session.user || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Get the user's wishlists
    const wishlists = await userService.getUserWishlists(userId);

    return NextResponse.json({ wishlists });
  } catch (error) {
    console.error('Error fetching user wishlists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
