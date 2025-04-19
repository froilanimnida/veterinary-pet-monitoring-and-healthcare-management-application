import NextAuth, { type AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib";
import { nextAuthLogin } from "@/actions";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { role_type } from "@prisma/client";

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    pages: {
        signIn: "/signin",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                if (!credentials || !credentials.email || !credentials.password) {
                    return null;
                }
                const data = await nextAuthLogin(credentials?.email, credentials?.password);
                const userData = data.success ? data.data : null;
                if (userData === null || userData === undefined) {
                    return null;
                }
                return {
                    id: userData.user.user_id.toString(),
                    email: userData.user.email,
                    role: userData.user.role as role_type,
                    name: userData.user.first_name
                        ? `${userData.user.first_name} ${userData.user.last_name || ""}`.trim()
                        : null,
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.email = token.email;
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        },
        async signIn() {
            //if (!user || !account || !profile || !account.provider || !profile.email) {
            //    return false;
            //}
            //if (account.provider === "google") {
            //    return profile.email.endsWith("@gmail.com");
            //}
            return true;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
