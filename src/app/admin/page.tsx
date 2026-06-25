import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"
import Link from "next/link"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== UserRole.ADMIN) redirect("/")

  const [questionCount, publishedCount, userCount, practiceSetCount] = await Promise.all([
    db.question.count(),
    db.question.count({ where: { status: "PUBLISHED" } }),
    db.user.count(),
    db.practiceSet.count(),
  ])

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-center">
          <Link href="/" className="mr-3 text-blue-600 hover:text-blue-800">
            ← 前台
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{questionCount}</div>
            <div className="mt-1 text-sm text-gray-500">题目总数</div>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600">{publishedCount}</div>
            <div className="mt-1 text-sm text-gray-500">已发布</div>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-purple-600">{userCount}</div>
            <div className="mt-1 text-sm text-gray-500">用户数</div>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-orange-600">{practiceSetCount}</div>
            <div className="mt-1 text-sm text-gray-500">题组数</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href="/admin/questions"
            className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-2 text-2xl">📋</div>
            <div className="font-semibold text-gray-900">题目管理</div>
            <div className="mt-1 text-sm text-gray-500">查看、编辑、下架题目</div>
          </Link>

          <Link
            href="/admin/import"
            className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-2 text-2xl">📥</div>
            <div className="font-semibold text-gray-900">导入题库</div>
            <div className="mt-1 text-sm text-gray-500">批量导入 JSON 格式题目</div>
          </Link>
        </div>
      </div>
    </main>
  )
}
