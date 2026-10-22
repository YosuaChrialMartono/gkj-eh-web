import "server-only"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { eq } from "drizzle-orm"
import { getDb } from "@/lib/server/db"
import { users, accounts } from "@/lib/server/db/schema"
import { authenticateCredentials } from "@/lib/server/auth/users"
import { getServerEnv } from "@/lib/server/env"

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const env = getServerEnv()
  return {
    secret: env.AUTH_SECRET,
    adapter: DrizzleAdapter(getDb(), { usersTable: users, accountsTable: accounts }),
    session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
    pages: { signIn: "/login" },
    providers: [Credentials({ credentials: { email: {}, password: {} }, authorize: authenticateCredentials }),
      ...(env.AUTH_GOOGLE_ID ? [Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET, allowDangerousEmailAccountLinking: false, profile(profile) {
        return { id: profile.sub, name: profile.name || profile.email, email: profile.email?.trim().toLowerCase(), image: profile.picture }
      } })] : [])],
    callbacks: {
      async signIn({ account, profile }) { return account?.provider !== "google" || profile?.email_verified === true },
      async jwt({ token, user }) {
        if (user?.id) {
          const [row] = await getDb().select({ version: users.sessionVersion }).from(users).where(eq(users.id, user.id))
          token.version = row?.version
        }
        return token
      },
      async session({ session, token }) {
        if (token.sub) session.user.id = token.sub
        return { ...session, version: token.version }
      },
      redirect({ url, baseUrl }) {
        try { const target = new URL(url, baseUrl); return target.origin === new URL(baseUrl).origin ? target.href : `${baseUrl}/dashboard` } catch { return `${baseUrl}/dashboard` }
      },
    },
  }
})
