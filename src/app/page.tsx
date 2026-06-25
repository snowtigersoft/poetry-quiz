import Link from "next/link"
import { auth } from "@/lib/auth"

export default async function HomePage() {
  const session = await auth()

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-amber-900">
            {process.env.NEXT_PUBLIC_APP_NAME ?? "古诗文刷题"}
          </h1>
          <p className="text-lg text-amber-700">专为小学生古诗文大会备赛设计</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/practice"
            className="rounded-2xl bg-amber-500 p-6 text-center text-white transition-colors hover:bg-amber-600"
          >
            <div className="mb-2 text-3xl">📖</div>
            <div className="text-xl font-semibold">开始刷题</div>
            <div className="mt-1 text-sm text-amber-100">按年级 / 题型练习</div>
          </Link>

          <Link
            href="/wrong"
            className="rounded-2xl bg-red-400 p-6 text-center text-white transition-colors hover:bg-red-500"
          >
            <div className="mb-2 text-3xl">📝</div>
            <div className="text-xl font-semibold">错题本</div>
            <div className="mt-1 text-sm text-red-100">查看需要加强的题目</div>
          </Link>

          <Link
            href="/favorites"
            className="rounded-2xl bg-yellow-400 p-6 text-center text-white transition-colors hover:bg-yellow-500"
          >
            <div className="mb-2 text-3xl">⭐</div>
            <div className="text-xl font-semibold">收藏题</div>
            <div className="mt-1 text-sm text-yellow-100">查看收藏的题目</div>
          </Link>

          {session ? (
            <Link
              href="/profile"
              className="rounded-2xl bg-green-500 p-6 text-center text-white transition-colors hover:bg-green-600"
            >
              <div className="mb-2 text-3xl">👤</div>
              <div className="text-xl font-semibold">个人中心</div>
              <div className="mt-1 text-sm text-green-100">
                {session.user?.name ?? session.user?.email}
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-2xl bg-blue-500 p-6 text-center text-white transition-colors hover:bg-blue-600"
            >
              <div className="mb-2 text-3xl">🔐</div>
              <div className="text-xl font-semibold">登录</div>
              <div className="mt-1 text-sm text-blue-100">登录后进度云端同步</div>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
