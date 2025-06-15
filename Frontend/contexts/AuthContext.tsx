"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      // Verify token and get user info
      fetchUserProfile(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async (token: string) => {
    try {
      const userData = await import("@/lib/api").then(module => module.authApi.getProfile())
      setUser(userData)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const data = await import("@/lib/api").then(module => module.authApi.login(email, password))
      localStorage.setItem("token", data.token)
      setUser(data.user)
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn trở lại!",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Lỗi đăng nhập",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      })
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const data = await import("@/lib/api").then(module => module.authApi.register(username, email, password))
      localStorage.setItem("token", data.token)
      setUser(data.user)
      toast({
        title: "Đăng ký thành công",
        description: "Chào mừng bạn đến với blog!",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Lỗi đăng ký",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn!",
    })
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
