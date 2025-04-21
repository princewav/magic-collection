import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Provider } from 'next-auth/providers';
import { userService } from '@/db/services/UserService';

export const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_ID!,
    clientSecret: process.env.GOOGLE_SECRET!,
  }),
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      try {
        // Check if credentials are provided
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Authenticate using UserService
        const userProfile = await userService.validateCredentials(
          credentials.email,
          credentials.password,
        );

        // If authentication failed, return null
        if (!userProfile) {
          return null;
        }

        // Return the user object in the format NextAuth expects
        return {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          image: userProfile.image || null,
        };
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
  }),
] as Provider[];
