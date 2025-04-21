import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth.config';
import { UserService } from '@/db/services/UserService';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/profile/ProfileForm';
import PasswordForm from '@/components/profile/PasswordForm';
import { UserProfile } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Magic Collection',
  description: 'Manage your profile settings',
};

export default async function ProfilePage() {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/profile');
  }

  const userId = session.user.id as string;

  // Get user profile data
  const userService = new UserService();
  const userProfile = await userService.findById(userId);

  if (!userProfile) {
    throw new Error('User profile not found');
  }

  return (
    <div className="container mx-auto flex flex-col p-4 md:max-w-4xl">
      <h1 className="mb-4 text-xl font-bold">Profile Settings</h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm user={userProfile as UserProfile} />
          </CardContent>
        </Card>

        <PasswordForm />
      </div>
    </div>
  );
}
