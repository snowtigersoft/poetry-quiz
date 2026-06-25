import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"
import Link from "next/link"

export default async function AdminQuestionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== UserRole.ADMIN) redirect("/")

  const questions = await db.question.findMany({
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      _count: { select: { attempts: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link href="/admin" className="mr-3 text-blue-600 hover:text-blue-800">
            ← 返回后台
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">题目管理</h1>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">题干</th>
                <th className="px-4 py-3 text-left text-gray-600">类型</th>
                <th className="px-4 py-3 text-left text-gray-600">年级</th>
                <th className="px-4 py-3 text-left text-gray-600">难度</th>
                <th className="px-4 py-3 text-left text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-gray-600">答题数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="max-w-xs truncate px-4 py-3 text-gray-900">{q.stem}</td>
                  <td className="px-4 py-3 text-gray-500">{q.type}</td>
                  <td className="px-4 py-3 text-gray-500">{q.grade ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{q.difficulty}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        q.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : q.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{q._count.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {questions.length === 0 && <div className="py-12 text-center text-gray-400">暂无题目</div>}
        </div>
      </div>
    </main>
  )
}
