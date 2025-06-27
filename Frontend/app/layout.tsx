import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import EnvLogger from "@/components/EnvLogger"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Modern Blog App",
  description: "A modern, feature-rich blog application",
    generator: 'v0.dev'
}

// Log environment variables on server side
console.log("🚀 Layout - Server Side Environment Check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("===============================");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <EnvLogger />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
