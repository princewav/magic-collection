import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userService } from '@/db/services/UserService';

// Create a validation schema
const userSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validation = userSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 },
      );
    }

    const userData = validation.data;

    try {
      // Create the user using UserService
      const newUser = await userService.createUser(userData);

      // Return success
      return NextResponse.json(
        {
          success: true,
          user: newUser,
        },
        { status: 201 },
      );
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      throw error; // Re-throw for general error handling
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
