import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { Provider } from 'next-auth/providers';

export const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_ID!,
    clientSecret: process.env.GOOGLE_SECRET!,
  }),
  GithubProvider({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  }),
] as Provider[];
