import type { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

// Create a client promise for the adapter
const clientPromise = Promise.resolve(
  new MongoClient(process.env.MONGODB_URI!),
);

// Extend the Session type to include the id
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authConfig: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [], // This will be passed from auth.ts
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        console.log('JWT callback - initial signin', { user });
        return {
          ...token,
          id: user.id,
        };
      }

      // Return previous token if the access token has not expired yet
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback', { token, session });
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
