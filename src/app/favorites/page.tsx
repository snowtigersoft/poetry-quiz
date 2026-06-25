import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"

export default async function FavoritesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-amber-50 px-4">
        <div className="text-center">
          <div className="mb-4 text-5xl">⭐</div>
          <h1 className="mb-4 text-2xl font-bold text-amber-900">收藏题</h1>
          <p className="mb-6 text-gray-600">登录后可查看云端收藏</p>
          <Link
            href="/login"
            className="rounded-xl bg-amber-500 px-6 py-3 text-white transition-colors hover:bg-amber-600"
          >
            登录
          </Link>
        </div>
      </main>
    )
  }

  const favorites = await db.favoriteQuestion.findMany({
    where: { userId: session.user.id },
    include: {
      question: {
        include: {
          options: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <main className="min-h-screen bg-amber-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link href="/" className="mr-3 text-amber-600 hover:text-amber-800">
            ← 返回
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">收藏题</h1>
          <span className="ml-auto text-sm text-gray-500">{favorites.length} 道收藏</span>
        </div>

        {favorites.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="mb-4 text-5xl">⭐</div>
            <p>还没有收藏任何题目</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((fav) => (
              <div key={fav.questionId} className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="mb-3 text-base text-gray-900">{fav.question.stem}</p>
                {fav.question.options.length > 0 && (
                  <div className="space-y-1">
                    {fav.question.options.map((opt) => (
                      <div key={opt.id} className="text-sm text-gray-600">
                        {opt.label}. {opt.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
