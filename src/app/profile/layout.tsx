import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth.config';
import { redirect } from 'next/navigation';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/profile');
  }

  return <>{children}</>;
}
