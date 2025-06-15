"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

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

interface UserCardProps {
  user: User
  showFollowButton?: boolean
}

export default function UserCard({ user, showFollowButton = true }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false)
  const [loading, setLoading] = useState(false)

  const handleFollow = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        toast({
          title: isFollowing ? "Đã bỏ theo dõi" : "Đã theo dõi",
          description: `${isFollowing ? "Bỏ theo dõi" : "Theo dõi"} ${user.username} thành công`,
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi thực hiện hành động",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
            <AvatarFallback className="text-lg">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Link href={`/profile/${user.id}`} className="text-lg font-semibold hover:underline">
              {user.username}
            </Link>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex space-x-4 mt-2 text-sm text-muted-foreground">
              <span>{user.postsCount} bài viết</span>
              <span>{user.followersCount} người theo dõi</span>
              <span>{user.followingCount} đang theo dõi</span>
            </div>
          </div>
          {showFollowButton && (
            <Button onClick={handleFollow} disabled={loading} variant={isFollowing ? "outline" : "default"}>
              {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
