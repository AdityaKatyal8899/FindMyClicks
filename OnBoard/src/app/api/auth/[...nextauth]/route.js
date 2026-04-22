import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        // Pass the Google account info into the JWT callback
        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.googleEmail = profile.email;
                token.googleName = profile.name;
                token.googleId = profile.sub;
            }
            return token;
        },

        // Expose the google info to the session
        async session({ session, token }) {
            session.googleEmail = token.googleEmail;
            session.googleId = token.googleId;
            if (session.user) {
                session.user.image = token.picture;
            }
            return session;
        },
    },

    // We do NOT use NextAuth's own pages — we redirect to our custom login
    pages: {
        signIn: '/login',
    },
});

export { handler as GET, handler as POST };
