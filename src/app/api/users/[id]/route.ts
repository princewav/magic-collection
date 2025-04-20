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

    // User must be authenticated and requesting their own profile
    if (!session || !session.user || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Get user profile
    const userProfile = await userService.findById(userId);
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get optional user content
    const includeContent =
      req.nextUrl.searchParams.get('include_content') === 'true';

    if (includeContent) {
      // Get user stats and content in parallel
      const [stats, decks, collection, wishlists] = await Promise.all([
        userService.getUserStats(userId),
        userService.getUserDecks(userId),
        userService.getUserCollection(userId),
        userService.getUserWishlists(userId),
      ]);

      return NextResponse.json({
        user: userProfile,
        stats,
        decks,
        collection,
        wishlists,
      });
    }

    // Return just the user profile if content not requested
    return NextResponse.json({ user: userProfile });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession({
      ...authConfig,
      providers,
    });

    // User must be authenticated and updating their own profile
    if (!session || !session.user || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    const updateData = await req.json();

    // Update user
    const updatedUser = await userService.updateUser(userId, updateData);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession({
      ...authConfig,
      providers,
    });

    // User must be authenticated and deleting their own account
    if (!session || !session.user || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Delete user
    const success = await userService.deleteUser(userId);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
