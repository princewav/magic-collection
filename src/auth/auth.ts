import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { providers } from './providers';

const handler = NextAuth({
  ...authConfig,
  providers,
});

export { handler as GET, handler as POST, handler as default };
