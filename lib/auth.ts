import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const coach = await prisma.coach.findUnique({
          where: { email: credentials.email }
        });

        if (!coach) {
          return null;
        }

        const isValid = await compare(credentials.password, coach.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: coach.id,
          email: coach.email,
          name: coach.fullName,
          role: coach.role,
          plan: coach.plan,
          status: coach.status,
          gymId: coach.gymId
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.plan = (user as any).plan;
        token.status = (user as any).status;
        token.gymId = (user as any).gymId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
        session.user.status = token.status as string;
        session.user.gymId = token.gymId as string | null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/sign-in"
  }
});
