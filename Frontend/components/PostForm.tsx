"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function PostForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { postApi } = await import("@/lib/api")
      await postApi.createPost(formData)
      toast({
        title: "Đăng bài thành công",
        description: "Bài viết của bạn đã được đăng tải!",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Lỗi đăng bài",
        description: "Có lỗi xảy ra khi đăng bài viết",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Tạo bài viết mới</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              name="title"
              placeholder="Nhập tiêu đề bài viết"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Viết nội dung bài viết của bạn..."
              value={formData.content}
              onChange={handleChange}
              rows={10}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng bài
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
