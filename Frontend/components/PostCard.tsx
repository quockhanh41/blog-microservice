"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2 } from "lucide-react"

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

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const handleLike = async () => {
    try {
      const { postApi } = await import("@/lib/api")
      await postApi.likePost(post.id)
      // Refresh the post data or update state
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  // Defensive check for author data
  const author = post.author || { id: 'unknown', username: 'Unknown User' };
  const authorAvatar = author.avatar || "/placeholder.svg";
  const authorUsername = author.username || "Unknown User";
  const authorId = author.id || 'unknown';

  return (
    <Card className="w-full transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={authorAvatar} alt={authorUsername} />
            <AvatarFallback>{authorUsername.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Link href={`/profile/${authorId}`} className="font-semibold hover:underline">
              {authorUsername}
            </Link>
            <p className="text-sm text-muted-foreground">
              {(() => {
                try {
                  // Debug: log the createdAt value
                  console.log('PostCard createdAt:', post.createdAt, typeof post.createdAt);
                  
                  if (!post.createdAt) {
                    return "Thời gian không xác định";
                  }
                  
                  const date = new Date(post.createdAt);
                  if (isNaN(date.getTime())) {
                    console.error('Invalid date in PostCard:', post.createdAt);
                    return "Thời gian không xác định";
                  }
                  
                  return formatDistanceToNow(date, {
                    addSuffix: true,
                    locale: vi,
                  });
                } catch (error) {
                  console.error('Error formatting date in PostCard:', error, post.createdAt);
                  return "Thời gian không xác định";
                }
              })()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <Link href={`/post/${post.id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer">{post.title}</h3>
          <p className="text-muted-foreground line-clamp-3">{post.content}</p>
        </Link>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <div className="flex items-center space-x-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-1 ${post.isLiked ? "text-red-500" : ""}`}
          >
            <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
            <span>{post.likesCount}</span>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/post/${post.id}`} className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount}</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-1">
            <Share2 className="h-4 w-4" />
            <span>Chia sẻ</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
