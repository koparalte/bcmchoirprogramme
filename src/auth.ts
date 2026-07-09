import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
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
