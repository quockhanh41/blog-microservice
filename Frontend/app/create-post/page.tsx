import Header from "@/components/Header"
import PostForm from "@/components/PostForm"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function CreatePostPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex justify-center">
          <PostForm />
        </main>
      </div>
    </ProtectedRoute>
  )
}
