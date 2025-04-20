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
  },
  callbacks: {
    jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
