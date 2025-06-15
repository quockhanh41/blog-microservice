import Header from "@/components/Header"
import FeedList from "@/components/FeedList"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Feed của bạn</h1>
            <p className="text-muted-foreground">Khám phá những bài viết mới nhất từ những người bạn theo dõi</p>
          </div>
          <FeedList />
        </main>
      </div>
    </ProtectedRoute>
  )
}
