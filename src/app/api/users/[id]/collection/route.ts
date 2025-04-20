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

    // User must be authenticated and requesting their own collection
    if (!session || !session.user || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Check for type filter (paper or arena)
    const type = req.nextUrl.searchParams.get('type') as
      | 'paper'
      | 'arena'
      | null;

    let collection;
    if (type === 'paper' || type === 'arena') {
      collection = await userService.getUserCollectionByType(userId, type);
    } else {
      collection = await userService.getUserCollection(userId);
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Error fetching user collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
