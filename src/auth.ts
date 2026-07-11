import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      try {
        if (user.email) {
           const baseUrl = process.env.NODE_ENV === 'development' 
               ? 'http://localhost:9002' 
               : (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://bcmchoirprogramme.vercel.app');
               
           await fetch(`${baseUrl}/api/log-login`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json'
             },
             body: JSON.stringify({ name: user.name, email: user.email })
           }).catch(e => console.error('Failed to dispatch login log:', e));
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
