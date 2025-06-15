"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/Header"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Heart, MessageCircle, Send } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

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

interface Comment {
  id: string
  content: string
  author: {
    id: string
    username: string
    avatar?: string
  }
  createdAt: string
}

export default function PostDetailPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [params.id])

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/posts/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPost(data)
      }
    } catch (error) {
      console.error("Error fetching post:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/posts/${params.id}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`http://localhost:8080/api/posts/${params.id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      fetchPost() // Refresh post data
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/posts/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        setNewComment("")
        fetchComments() // Refresh comments
        toast({
          title: "Bình luận thành công",
          description: "Bình luận của bạn đã được đăng!",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đăng bình luận",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
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

  if (!post) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8 text-center">
            <p>Không tìm thấy bài viết</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Post Detail */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.username} />
                  <AvatarFallback>{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/profile/${post.author.id}`} className="font-semibold hover:underline">
                    {post.author.username}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
              <div className="prose max-w-none mb-6">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
              <div className="flex items-center space-x-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center space-x-1 ${post.isLiked ? "text-red-500" : ""}`}
                >
                  <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                  <span>{post.likesCount}</span>
                </Button>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.commentsCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comment Form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleComment} className="space-y-4">
                <Textarea
                  placeholder="Viết bình luận của bạn..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting || !newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Bình luận
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Comments */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Bình luận ({comments.length})</h2>
            {comments.length === 0 ? (
              <p className="text-muted-foreground">Chưa có bình luận nào.</p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.username} />
                        <AvatarFallback>{comment.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Link
                            href={`/profile/${comment.author.id}`}
                            className="font-semibold text-sm hover:underline"
                          >
                            {comment.author.username}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
