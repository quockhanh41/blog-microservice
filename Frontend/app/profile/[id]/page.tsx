"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/Header"
import ProtectedRoute from "@/components/ProtectedRoute"
import UserCard from "@/components/UserCard"
import PostCard from "@/components/PostCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  followersCount: number
  followingCount: number
  postsCount: number
  isFollowing?: boolean
}

interface Post {
  id: string
  title: string
  content: string
  author: {
    id: string
    username: string
    avatar?: string
  }
  createdAt: string
  likesCount: number
  commentsCount: number
  isLiked?: boolean
}

export default function ProfilePage() {
  const params = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
    fetchUserPosts()
  }, [params.id])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/users/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/users/${params.id}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error("Error fetching user posts:", error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex justify-center items-center py-8">
            <div>Đang tải...</div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8 text-center">
            <p>Không tìm thấy người dùng</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const isOwnProfile = currentUser?.id === user.id

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <UserCard user={user} showFollowButton={!isOwnProfile} />
          </div>

          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts">Bài viết ({posts.length})</TabsTrigger>
              <TabsTrigger value="about">Giới thiệu</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6 mt-6">
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {isOwnProfile ? "Bạn chưa có bài viết nào." : "Người dùng này chưa có bài viết nào."}
                  </p>
                </div>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Thông tin cơ bản</h3>
                  <p className="text-muted-foreground">Email: {user.email}</p>
                  <p className="text-muted-foreground">Tên người dùng: {user.username}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Thống kê</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{user.postsCount}</p>
                      <p className="text-sm text-muted-foreground">Bài viết</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{user.followersCount}</p>
                      <p className="text-sm text-muted-foreground">Người theo dõi</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{user.followingCount}</p>
                      <p className="text-sm text-muted-foreground">Đang theo dõi</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
