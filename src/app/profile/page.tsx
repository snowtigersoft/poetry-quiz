import Image from "next/image"
import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const [totalAttempts, correctAttempts, wrongCount, favoritesCount] = await Promise.all([
    db.questionAttempt.count({ where: { userId } }),
    db.questionAttempt.count({ where: { userId, isCorrect: true } }),
    db.wrongQuestion.count({ where: { userId, resolved: false } }),
    db.favoriteQuestion.count({ where: { userId } }),
  ])

  const correctRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

  return (
    <main className="min-h-screen bg-amber-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link href="/" className="mr-3 text-amber-600 hover:text-amber-800">
            ← 返回
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">个人中心</h1>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "用户"}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full"
            />
          )}
          <div>
            <div className="text-xl font-bold text-gray-900">{session.user.name ?? session.user.email}</div>
            <div className="text-sm text-gray-500">{session.user.email}</div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-amber-600">{totalAttempts}</div>
            <div className="mt-1 text-sm text-gray-500">累计答题</div>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600">{correctRate}%</div>
            <div className="mt-1 text-sm text-gray-500">正确率</div>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-red-500">{wrongCount}</div>
            <div className="mt-1 text-sm text-gray-500">错题数</div>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-yellow-500">{favoritesCount}</div>
            <div className="mt-1 text-sm text-gray-500">收藏数</div>
          </div>
        </div>

        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl border-2 border-red-300 py-3 text-red-500 transition-colors hover:bg-red-50"
          >
            退出登录
          </button>
        </form>
      </div>
    </main>
  )
}
