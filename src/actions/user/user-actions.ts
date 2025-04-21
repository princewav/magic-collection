'use server';

import { revalidatePath } from 'next/cache';
import { UserService } from '@/db/services/UserService';
import { UserUpdateInput } from '@/types/user';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth.config';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

/**
 * Update user profile information
 */
export async function updateUserProfile(userData: UserUpdateInput) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id as string;
  const userService = new UserService();

  try {
    const updatedUser = await userService.updateUser(userId, userData);
    if (!updatedUser) {
      throw new Error('Failed to update user profile');
    }

    // Force revalidation of all routes to refresh session
    revalidatePath('/', 'layout');

    // Return the updated user for the client to update session
    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image || null,
      },
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Update user profile image
 */
export async function updateProfileImage(formData: FormData) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id as string;
  const userService = new UserService();

  try {
    const file = formData.get('profileImage') as File;

    if (!file) {
      throw new Error('No image provided');
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Here we would typically upload to a storage service like S3
    // For simplicity, we'll simulate storing the image URL
    // In a real app, implement file upload to cloud storage

    // This is a placeholder. In a real app, replace with actual upload code
    const imageUrl = await simulateImageUpload(file.name, buffer);

    // Update user with new image URL
    const updatedUser = await userService.updateUser(userId, {
      image: imageUrl,
    });

    if (!updatedUser) {
      throw new Error('Failed to update profile image');
    }

    // Force revalidation of all routes to refresh session
    revalidatePath('/', 'layout');

    return {
      success: true,
      imageUrl,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: imageUrl,
      },
    };
  } catch (error) {
    console.error('Error updating profile image:', error);
    throw error;
  }
}

/**
 * Simulate image upload (placeholder)
 * In a real app, replace with actual cloud storage upload
 */
async function simulateImageUpload(
  filename: string,
  buffer: Buffer,
): Promise<string> {
  // This is a placeholder function
  // In a real app, implement actual file upload to cloud storage

  // For demo purposes, just return a made-up URL
  // This simulates a successful upload to a storage service
  return `https://example.com/profile-images/${Date.now()}-${filename}`;
}

/**
 * Update user password
 */
export async function updateUserPassword(
  currentPassword: string,
  newPassword: string,
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id as string;
  const userService = new UserService();

  try {
    // First, get the user to verify current password
    const user = await userService.findByEmailForAuth(
      session.user.email as string,
    );

    if (!user || !user.password) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new Error('Current password is incorrect');
    }

    // Update with new password
    const updatedUser = await userService.updateUser(userId, {
      password: newPassword, // Note: UserService will hash this
    });

    if (!updatedUser) {
      throw new Error('Failed to update password');
    }

    // Force revalidation of all routes to refresh session
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}
