import NextAuth from "next-auth"
import spHelper from "./app/lib/supabase/supabaseHelper"
import GoogleProvider from "next-auth/providers/google";


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  })],
  pages: {
    signIn: "/login",
    error: "/error"
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      var userInfo = await spHelper.getUser(user);
      if (userInfo.permission) {
        return true;
      }
      else {
        throw new Error("NoPermission");
      }
    },
    async redirect({ url, baseUrl }) {
      return "/account"; // always redirect to account after login
    },
  }
})
