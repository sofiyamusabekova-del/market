import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    }),
    CredentialsProvider({
      id: 'demo-google',
      name: 'Google Demo Login',
      credentials: {},
      async authorize() {
        return {
          id: 'user-google-demo',
          name: 'Google Demo User',
          email: 'customer@gmail.com',
          image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return true;

      // Persist or update user in Neon Postgres DB
      if (prisma) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true },
          });

          if (!existingUser) {
            const created = await prisma.user.create({
              data: {
                email: user.email,
                fullName: user.name || 'Customer',
                role: 'CUSTOMER',
              },
            });

            if (account) {
              await prisma.account.create({
                data: {
                  userId: created.id,
                  type: account.type || 'oauth',
                  provider: account.provider || 'google',
                  providerAccountId: account.providerAccountId || created.id,
                  access_token: account.access_token,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
            }
          } else {
            // Update name if changed
            if (user.name && user.name !== existingUser.fullName) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { fullName: user.name },
              });
            }

            // Link account if not linked yet
            if (account && !existingUser.accounts.some((a) => a.provider === account.provider)) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type || 'oauth',
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
            }
          }
        } catch (err) {
          console.error('Error persisting user to database:', err);
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;

        // Fetch user id and role from DB if available
        if (prisma && user.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.role = dbUser.role;
            }
          } catch (err) {
            console.error('Error attaching db user to token:', err);
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).role = token.role || 'CUSTOMER';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'voltstore-secret-jwt-key-2026',
};
