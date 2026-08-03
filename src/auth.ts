import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getAllAkses } from "./lib/googleSheets"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        try {
          const users = await getAllAkses();
          
          // Find user by email (case-insensitive column check)
          const user = users.find((u: any) => (u.Email || u.EMAIL || u.email) === credentials.email);
          
          if (!user) {
            // Fallback to hardcoded admin if google sheets has no users yet or fails
            if (credentials.email === "admin@rsdgunungjati.id" && credentials.password === "admin123") {
              return {
                id: "admin-123",
                email: "admin@rsdgunungjati.id",
                name: "Administrator IT",
                role: "ADMIN_IT",
                unit: "Instalasi SIMRS",
              }
            }
            return null;
          }
          
          // Note: In a real production app, password should be hashed. 
          // But per user requirements, it's plaintext in the Sheet.
          const userPassword = user.Password || user.PASSWORD || user.password;
          if (userPassword !== credentials.password) {
            return null;
          }
          
          return {
            id: user.Email || user.EMAIL || user.email,
            email: user.Email || user.EMAIL || user.email,
            name: user.Nama || user.NAMA || user.nama,
            role: user.Role || user.ROLE || user.role,
            unit: user.Unit || user.UNIT || user.unit,
          }
        } catch (e) {
          console.error("Auth Error:", e);
          return null;
        }
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
