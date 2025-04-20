import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Provider } from 'next-auth/providers';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_ID!,
    clientSecret: process.env.GOOGLE_SECRET!,
  }),
  GithubProvider({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
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
          console.log('Missing credentials');
          return null;
        }

        // Connect to MongoDB
        const client = new MongoClient(process.env.MONGODB_URI!);
        await client.connect();

        const db = client.db('magic-collection');
        const usersCollection = db.collection('users');

        // Find the user with the provided email
        const user = await usersCollection.findOne({
          email: credentials.email,
        });

        // Close the MongoDB connection
        await client.close();

        // Check if user exists
        if (!user) {
          console.log('User not found', credentials.email);
          return null;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          console.log('Invalid password');
          return null;
        }

        console.log('Authentication successful', {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        });

        // Return the user object in the format NextAuth expects
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || null,
        };
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
  }),
] as Provider[];
