import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { logLoginToSheet } from "@/lib/actions";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      try {
        if (user.email) {
          await logLoginToSheet(user.name, user.email);
        }
      } catch (e) {
        console.error("Failed to log login:", e);
      }
      return true;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProgress = nextUrl.pathname.startsWith('/progress');
      if (isOnProgress) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL('/', nextUrl)); // Redirect unauthenticated users to home page
      }
      return true;
    },
  },
});
