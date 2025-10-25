import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // Note: PrismaAdapter is removed when using JWT strategy with CredentialsProvider
  // adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })
    ] : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Only try database operations if we have a database connection
          if (!process.env.DATABASE_URL) {
            console.warn('No DATABASE_URL configured, credentials auth disabled')
            return null
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt', // Use JWT strategy for sessions (required for CredentialsProvider)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: true, // Enable debug mode to see what's happening
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn Callback - user:', user, 'account:', account, 'profile:', profile)
      
      // For OAuth providers (Google), save user to database if not exists
      if (account?.provider === 'google' && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (!existingUser) {
            // Create new user in database
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
              }
            })
            console.log('New user created via Google OAuth:', user.email)
          } else {
            console.log('Existing user signed in via Google OAuth:', user.email)
          }
        } catch (error) {
          console.error('Error saving Google OAuth user:', error)
          // Don't block sign-in if database save fails
        }
      }
      
      return true
    },
    async jwt({ token, user, account }) {
      console.log('JWT Callback - token:', token, 'user:', user, 'account:', account)
      // Persist the OAuth account info or user data to the token when signing in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session Callback - session:', session, 'token:', token)
      // Add user info to session from token
      if (token && session.user) {
        (session.user as any).id = token.id || token.sub
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('Auth redirect called:', { url, baseUrl })
      
      // If the URL is just the base URL (after sign-in), redirect to dashboard
      if (url === baseUrl || url === baseUrl + '/') {
        console.log('Redirecting to dashboard from base URL')
        return `${baseUrl}/dashboard`
      }
      
      // If it's a relative callback URL, make it absolute and check if it should go to dashboard
      if (url.startsWith("/")) {
        const absoluteUrl = `${baseUrl}${url}`
        // If it's a sign-in related URL, redirect to dashboard
        if (url.includes('/signin') || url.includes('/signup') || url === '/') {
          console.log('Redirecting to dashboard from auth page')
          return `${baseUrl}/dashboard`
        }
        return absoluteUrl
      }
      
      // If it's an absolute URL on the same origin, allow it
      try {
        const urlObject = new URL(url)
        const baseUrlObject = new URL(baseUrl)
        if (urlObject.origin === baseUrlObject.origin) {
          // If it's pointing to auth pages, redirect to dashboard
          if (urlObject.pathname.includes('/signin') || urlObject.pathname.includes('/signup') || urlObject.pathname === '/') {
            console.log('Redirecting to dashboard from same origin auth URL')
            return `${baseUrl}/dashboard`
          }
          return url
        }
      } catch (error) {
        console.error('Error parsing URL in redirect:', error)
      }
      
      // Default fallback - always go to dashboard
      console.log('Default redirect to dashboard')
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}