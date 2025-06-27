"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/Header"
import ProtectedRoute from "@/components/ProtectedRoute"
import UserCard from "@/components/UserCard"
import PostCard from "@/components/PostCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
require("dotenv").config()
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

interface AllUser {
  id: string
  username: string
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

interface ApiPostResponse {
  id: string
  author_id: string
  username: string
  title: string
  content: string
  created_at: string
  likes_count?: number
  comments_count?: number
  is_liked?: boolean
  avatar?: string
}

export default function ProfilePage() {
  const params = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [allUsers, setAllUsers] = useState<AllUser[]>([])
  const [followingUsers, setFollowingUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [followingLoading, setFollowingLoading] = useState<string | null>(null)
  const hasFetched = useRef<string | null>(null)

  useEffect(() => {
    if (!params.id) return
    
    // Prevent double fetching in development (React Strict Mode)
    const currentUserId = params.id.toString()
    if (hasFetched.current === currentUserId) return
    
    let isMounted = true
    hasFetched.current = currentUserId
    
    // Backup timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Loading timeout reached, setting loading to false')
        setLoading(false)
      }
    }, 10000) // 10 seconds timeout
    
    const loadData = async () => {
      // Reset loading state
      setLoading(true)
      
      try {
        console.log(`Loading data for user: ${currentUserId}`)
        // Load all data concurrently
        const [profileResult, postsResult, allUsersResult, followingResult] = await Promise.allSettled([
          fetchUserProfile(isMounted),
          fetchUserPosts(isMounted),
          fetchAllUsers(isMounted),
          fetchFollowingUsers(isMounted)
        ])
        
        if (profileResult.status === 'rejected') {
          console.error('Profile fetch failed:', profileResult.reason)
        }
        if (postsResult.status === 'rejected') {
          console.error('Posts fetch failed:', postsResult.reason)
        }
        if (allUsersResult.status === 'rejected') {
          console.error('All users fetch failed:', allUsersResult.reason)
        }
        if (followingResult.status === 'rejected') {
          console.error('Following users fetch failed:', followingResult.reason)
        }
        
        console.log('Both API calls completed')
      } catch (error) {
        console.error('Unexpected error in loadData:', error)
      } finally {
        // Always set loading to false, regardless of success/failure
        if (isMounted) {
          console.log('Setting loading to false')
          setLoading(false)
          clearTimeout(loadingTimeout)
        }
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
      clearTimeout(loadingTimeout)
    }
  }, [params.id])

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  const fetchUserProfile = async (isMounted = true) => {
    try {
      const token = localStorage.getItem("token")
      console.log('Fetching user profile with token:', token ? 'Token exists' : 'No token')

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('User profile response status:', response.status, response.ok)

      if (response.ok && isMounted) {
        const data = await response.json()
        console.log('User profile data:', data)
        setUser(data)
      } else if (!response.ok) {
        console.error('Failed to fetch user profile:', response.status, response.statusText)
        const errorData = await response.text()
        console.error('Error response:', errorData)
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error fetching user profile:", error)
      }
      throw error // Re-throw để Promise.allSettled có thể catch
    }
  }

  const fetchUserPosts = async (isMounted = true) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/posts/posts/user/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok && isMounted) {
        const data = await response.json()
        
        // Only log if we have meaningful data
        if (data && Array.isArray(data) && data.length > 0) {
          console.log(`Fetched ${data.length} posts for user ${params.id}:`, data)
        } else {
          console.log(`No posts found for user ${params.id}`)
        }
        
        // Map API response to Post interface
        if (Array.isArray(data)) {
          const mappedPosts = data.map((post: ApiPostResponse) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            author: {
              id: post.author_id,
              username: post.username,
              avatar: post.avatar || "/placeholder.svg"
            },
            createdAt: post.created_at,
            likesCount: post.likes_count || 0,
            commentsCount: post.comments_count || 0,
            isLiked: post.is_liked || false
          }))
          setPosts(mappedPosts)
        } else {
          console.error("Invalid posts data:", data)
          setPosts([]) // Set empty array for invalid data
        }
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error fetching user posts:", error)
        setPosts([]) // Set empty array on error
      }
      throw error // Re-throw để Promise.allSettled có thể catch
    }
  }

  const fetchAllUsers = async (isMounted = true) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/users/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok && isMounted) {
        const data = await response.json()
        console.log('All users data:', data)
        setAllUsers(data)
      } else if (!response.ok) {
        console.error('Failed to fetch all users:', response.status, response.statusText)
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error fetching all users:", error)
      }
      throw error
    }
  }

  const fetchFollowingUsers = async (isMounted = true) => {
    try {
      const token = localStorage.getItem("token")
      if (!currentUser?.id) return

      const response = await fetch(`${API_BASE_URL}/users/users/${currentUser.id}/following`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok && isMounted) {
        const data = await response.json()
        console.log('Following users data:', data)
        // Extract user IDs from following list
        const followingIds = data.map((user: AllUser) => user.id)
        setFollowingUsers(followingIds)
      } else if (!response.ok) {
        console.error('Failed to fetch following users:', response.status, response.statusText)
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error fetching following users:", error)
      }
      throw error
    }
  }

  const handleFollowToggle = async (targetUserId: string) => {
    try {
      setFollowingLoading(targetUserId) // Set loading state for this specific user
      const token = localStorage.getItem("token")
      if (!currentUser?.id) return

      const isCurrentlyFollowing = followingUsers.includes(targetUserId)
      
      if (isCurrentlyFollowing) {
        // Unfollow
        const response = await fetch(`${API_BASE_URL}/users/users/${currentUser.id}/unfollow`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetUserId })
        })

        if (response.ok) {
          setFollowingUsers(prev => prev.filter(id => id !== targetUserId))
          console.log('Successfully unfollowed user')
        } else {
          console.error('Failed to unfollow user:', await response.text())
        }
      } else {
        // Follow
        const response = await fetch(`${API_BASE_URL}/users/users/${currentUser.id}/follow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetUserId })
        })

        if (response.ok) {
          setFollowingUsers(prev => [...prev, targetUserId])
          console.log('Successfully followed user')
        } else {
          console.error('Failed to follow user:', await response.text())
        }
      }
    } catch (error) {
      console.error("Error toggling follow status:", error)
    } finally {
      setFollowingLoading(null) // Clear loading state
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div>Đang tải...</div>
              <div className="text-sm text-muted-foreground mt-2">
                Kiểm tra console để xem chi tiết
              </div>
              <button 
                onClick={() => setLoading(false)} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Skip Loading (Debug)
              </button>
            </div>
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">Bài viết ({posts.length})</TabsTrigger>
              <TabsTrigger value="users">Tất cả người dùng</TabsTrigger>
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

            <TabsContent value="users" className="mt-6">
              <div className="space-y-4">
                <h3 className="font-semibold mb-4">Tất cả người dùng</h3>
                {allUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Không có người dùng nào.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allUsers.map((userItem) => (
                      <div 
                        key={userItem.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {userItem.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{userItem.username}</span>
                        </div>
                        
                        {userItem.id !== currentUser?.id && (
                          <button
                            onClick={() => handleFollowToggle(userItem.id)}
                            disabled={followingLoading === userItem.id}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              followingUsers.includes(userItem.id)
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {followingLoading === userItem.id 
                              ? 'Loading...' 
                              : followingUsers.includes(userItem.id) 
                                ? 'Following' 
                                : 'Follow'
                            }
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Thông tin cơ bản</h3>
                  <p className="text-muted-foreground">Email: {user.email}</p>
                  <p className="text-muted-foreground">Tên người dùng: {user.username}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
