import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "./lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        if (credentials?.email === "admin@rsdgunungjati.id" && credentials?.password === "admin123") {
          return {
            id: "admin-123",
            email: "admin@rsdgunungjati.id",
            name: "Administrator IT",
            role: "ADMIN_IT",
            unit: "Instalasi SIMRS",
          }
        }
        
        return null;
        
        /* 
        // Temporarily commented out for demo without Postgres setup
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (!user || !user.passwordHash) return null
        
        const isPasswordValid = await compare(credentials.password as string, user.passwordHash)
        
        if (!isPasswordValid) return null
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          unit: user.unit,
        }
        */
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.unit = user.unit
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.unit = token.unit as string
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  }
})
