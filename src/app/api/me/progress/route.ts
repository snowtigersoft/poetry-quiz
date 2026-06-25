import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const [totalAttempts, correctAttempts, states] = await Promise.all([
    db.questionAttempt.count({ where: { userId } }),
    db.questionAttempt.count({ where: { userId, isCorrect: true } }),
    db.userQuestionState.findMany({
      where: { userId },
      include: { question: { select: { id: true, type: true, difficulty: true } } },
    }),
  ])

  const masteredCount = states.filter((s) => s.mastery >= 0.7).length
  const wrongCount = await db.wrongQuestion.count({
    where: { userId, resolved: false },
  })
  const favoritesCount = await db.favoriteQuestion.count({ where: { userId } })

  return NextResponse.json({
    totalAttempts,
    correctRate: totalAttempts > 0 ? correctAttempts / totalAttempts : 0,
    masteredCount,
    wrongCount,
    favoritesCount,
  })
}
