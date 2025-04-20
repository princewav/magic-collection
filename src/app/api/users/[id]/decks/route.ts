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

    // User must be authenticated and requesting their own decks
    if (!session || !session.user || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Check for type filter (paper or arena)
    const type = req.nextUrl.searchParams.get('type') as
      | 'paper'
      | 'arena'
      | null;

    let decks;
    if (type === 'paper' || type === 'arena') {
      decks = await userService.getUserDecksByType(userId, type);
    } else {
      decks = await userService.getUserDecks(userId);
    }

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('Error fetching user decks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
