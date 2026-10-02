import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { DUMMY_HASH, verifyPassword } from "./password";
import { checkAndCancelOnLogin } from "@/lib/auth/deletion";
import { sendEmail } from "@/lib/email/brevo";
import AccountRestoredTemplate from "@/lib/email/templates/account-restored";
import { siteConfig } from "@/content/config";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.passwordHash) {
          await verifyPassword(password, DUMMY_HASH);
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

                if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // Restore check: if a pending/scheduled deletion exists,
        // cancel it and fire the welcome-back email.
        // DB restore is awaited (must be committed before login completes).
        // Email is fire-and-forget — its failure must NOT block login.
        try {
          const restore = await checkAndCancelOnLogin(user.id);
          if (restore.restored) {
            const html = AccountRestoredTemplate({
              name: user.name,
              email: user.email,
              requestedAt: restore.requestedAt,
              restoredAt: restore.cancelledAt,
            });
            void sendEmail({
              to: user.email,
              toName: user.name ?? user.email,
              subject: `Welcome back to ${siteConfig.title}`,
              html,
            }).catch((err) => {
              console.error("[auth] Welcome-back email failed:", err);
            });
          }
        } catch (err) {
          // Never fail login because of restore-check errors.
          console.error("[auth] Restore check failed:", err);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
       async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role;
        token.username = user.username ?? null;
        token.name = user.name ?? null;
        token.picture = user.image ?? null;
      }

      // On client-side session.update(), refresh from DB so navbar
      // reflects avatar/name/username changes without logout-login.
      if (trigger === "update" && typeof token.id === "string" && token.id) {
        try {
          const fresh = await prisma.user.findUnique({
            where: { id: token.id },
            select: {
              name: true,
              image: true,
              username: true,
              role: true,
            },
          });
          if (fresh) {
            token.name = fresh.name;
            token.picture = fresh.image;
            token.username = fresh.username;
            token.role = fresh.role;
          }
        } catch (err) {
          console.error("[auth] session update refresh failed:", err);
        }
      }

      return token;
    },
        async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username ?? null;
        session.user.name = (token.name as string | null | undefined) ?? null;
        session.user.image = (token.picture as string | null | undefined) ?? null;
      }
      return session;
    },
  },
});
