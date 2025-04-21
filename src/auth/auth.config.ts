import type { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

const dbName = process.env.MONGODB_DB || 'magic';

// Create a client promise for the adapter
const clientPromise = Promise.resolve(
  new MongoClient(process.env.MONGODB_URI!),
).then((client) => {
  return client.connect().then(() => client);
});

// Create adapter with options to specify the database name
const adapter = MongoDBAdapter(clientPromise, {
  databaseName: dbName,
});

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

// Add custom properties to JWT
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export const authConfig: NextAuthOptions = {
  adapter,
  providers: [], // This will be passed from auth.ts
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
        };
      }

      // Handle session update
      if (trigger === 'update' && session) {
        // Update the JWT with the session data
        return {
          ...token,
          ...session,
        };
      }

      // Return previous token if the access token has not expired yet
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Copy properties from token to session
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;

        // If the token has an image, add it to the session
        if (token.image) {
          session.user.image = token.image;
        }
      }
      return session;
    },
  },
};
