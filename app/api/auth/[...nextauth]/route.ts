import NextAuth, { type AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { config } from '@/lib/config/next-auth-config';

const prisma = new PrismaClient();

const authOptions: AuthOptions = {
	adapter: PrismaAdapter(prisma),
	session: { strategy: 'jwt' },
	pages: {
		signIn: '/auth/login',
	},
	providers: config.providers,

	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.role = user.role;
			}
			return token;
		},
		session({ session, token }) {
			if (token && session.user) {
				session.user.email = token.email;
				session.user.role = token.role;
			}
			return session;
		},
		signIn() {
			return true;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
