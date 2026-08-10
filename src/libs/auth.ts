import { prisma } from "@/libs/prisma";
import { isRateLimited } from "@/libs/rate-limit";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials, req) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const forwardedFor = req?.headers?.["x-forwarded-for"];
        const ip = Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : (forwardedFor?.split(",")[0].trim() ?? "unknown");

        // Limite par IP (anti brute-force générique) et par email
        // (protège un compte ciblé même via des IP tournantes).
        if (
          isRateLimited(`login-ip:${ip}`, { limit: 20, windowMs: 15 * 60_000 }) ||
          isRateLimited(`login-email:${credentials.email}`, {
            limit: 5,
            windowMs: 15 * 60_000,
          })
        ) {
          throw new Error("TOO_MANY_ATTEMPTS");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: !!user.emailVerified,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = !!user.emailVerified;
        return token;
      }

      // À chaque lecture de session (pas seulement au login), on
      // resynchronise depuis la base : ça propage les changements de
      // profil (nom, vérification d'email, rôle) et invalide la session
      // si le compte a été supprimé entre-temps.
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
      });

      if (!dbUser) {
        // Non-standard mais supporté par next-auth à l'exécution : un jwt
        // callback qui retourne une valeur falsy invalide la session.
        return null as unknown as typeof token;
      }

      token.name = dbUser.name;
      token.email = dbUser.email;
      token.role = dbUser.role;
      token.emailVerified = !!dbUser.emailVerified;
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        role: token.role as string,
        emailVerified: token.emailVerified as boolean,
      },
    }),
  },
  pages: {
    signIn: "/auth/signin",
  },
};
