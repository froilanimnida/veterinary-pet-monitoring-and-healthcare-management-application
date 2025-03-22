import { loginAccount } from '@/actions/auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Role } from '@/types/next-auth';

export const config = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: {},
				password: {},
			},
			async authorize(credentials) {
				if (
					!credentials ||
					!credentials.email ||
					!credentials.password
				) {
					return null;
				}
				const userData = await loginAccount(
					credentials?.email,
					credentials?.password,
				);
				if (userData === null || userData === undefined) {
					return null;
				}
				return {
					id: userData.user_id.toString(),
					email: userData.email,
					role: userData.role as Role,
					name: userData.first_name
						? `${userData.first_name} ${
								userData.last_name || ''
						  }`.trim()
						: null,
				};
			},
		}),
	],
} satisfies NextAuthOptions;
