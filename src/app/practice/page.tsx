import Link from "next/link"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function PracticePage() {
  const practiceSets = await db.practiceSet.findMany({
    where: { isPublic: true },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "desc" },
  })

  const gradeGroups: Record<number, typeof practiceSets> = {}
  const noGrade: typeof practiceSets = []

  for (const set of practiceSets) {
    if (set.grade) {
      if (!gradeGroups[set.grade]) gradeGroups[set.grade] = []
      gradeGroups[set.grade].push(set)
    } else {
      noGrade.push(set)
    }
  }

  const gradeNames: Record<number, string> = {
    1: "一年级",
    2: "二年级",
    3: "三年级",
    4: "四年级",
    5: "五年级",
    6: "六年级",
  }

  return (
    <main className="min-h-screen bg-amber-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link href="/" className="mr-3 text-amber-600 hover:text-amber-800">
            ← 返回
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">练习入口</h1>
        </div>

        {Object.entries(gradeGroups)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([grade, sets]) => (
            <section key={grade} className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-amber-800">
                {gradeNames[Number(grade)] ?? `${grade}年级`}
              </h2>
              <div className="space-y-3">
                {sets.map((set) => (
                  <Link
                    key={set.id}
                    href={`/practice/${set.id}`}
                    className="block rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{set.title}</div>
                        {set.description && (
                          <div className="mt-1 text-sm text-gray-500">{set.description}</div>
                        )}
                      </div>
                      <div className="ml-4 shrink-0 text-sm text-amber-600">
                        {set._count.questions} 题 →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}

        {noGrade.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-amber-800">综合练习</h2>
            <div className="space-y-3">
              {noGrade.map((set) => (
                <Link
                  key={set.id}
                  href={`/practice/${set.id}`}
                  className="block rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{set.title}</div>
                      {set.description && (
                        <div className="mt-1 text-sm text-gray-500">{set.description}</div>
                      )}
                    </div>
                    <div className="ml-4 shrink-0 text-sm text-amber-600">
                      {set._count.questions} 题 →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {practiceSets.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <div className="mb-4 text-5xl">📚</div>
            <p>暂无题组，请等待管理员添加题目</p>
          </div>
        )}
      </div>
    </main>
  )
}
