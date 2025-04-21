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
  const body = await req.json();
  const validation = userSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.format() },
      { status: 400 },
    );
  }

  try {
    const newUser = await userService.createUser(validation.data);
    return NextResponse.json(
      { success: true, user: newUser },
      { status: 201 },
    );
  } catch (error: any) {
    const status = error.message === 'User with this email already exists' ? 409 : 500;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status });
  }
}
