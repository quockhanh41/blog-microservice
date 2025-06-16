"use client"

import { useState, useEffect } from "react"
import PostCard from "./PostCard"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

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

export default function FeedList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = async (pageNum = 1) => {
    try {
      const { feedApi } = await import("@/lib/api")
      const data = await feedApi.getFeed({ page: pageNum, limit: 5 })
      
      // Ensure data and data.posts exist
      if (data && Array.isArray(data.posts)) {
        if (pageNum === 1) {
          setPosts(data.posts)
        } else {
          setPosts((prev) => [...prev, ...data.posts])
        }
        setHasMore(data.hasMore || false)
      } else {
        // If data is invalid, set empty array for first page
        if (pageNum === 1) {
          setPosts([])
        }
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      // On error, ensure posts is set to empty array for first page
      if (pageNum === 1) {
        setPosts([])
      }
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const loadMore = () => {
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Chưa có bài viết nào trong feed của bạn.</p>
        <p className="text-sm text-muted-foreground mt-2">Hãy theo dõi một số người dùng để xem bài viết của họ!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button onClick={loadMore} disabled={loadingMore} variant="outline">
            {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tải thêm
          </Button>
        </div>
      )}
    </div>
  )
}
