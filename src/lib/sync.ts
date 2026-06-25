import { db } from "@/lib/db"
import { LocalAttempt } from "@/types/progress"
import { Prisma } from "@prisma/client"

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}

export async function syncLocalAttempts(
  userId: string,
  attempts: LocalAttempt[]
): Promise<{ synced: number; skipped: number }> {
  let synced = 0
  let skipped = 0

  for (const attempt of attempts) {
    try {
      const question = await db.question.findUnique({
        where: { id: attempt.questionId },
      })
      if (!question) {
        skipped++
        continue
      }

      await db.$transaction(async (tx) => {
        const existing = await tx.questionAttempt.findUnique({
          where: { userId_localId: { userId, localId: attempt.localId } },
        })

        if (!existing) {
          await tx.questionAttempt.create({
            data: {
              userId,
              localId: attempt.localId,
              questionId: attempt.questionId,
              questionVersion: attempt.questionVersion,
              answer: toJsonValue(attempt.answer),
              isCorrect: attempt.isCorrect,
              durationMs: attempt.durationMs,
              createdAt: new Date(attempt.createdAt),
            },
          })
        }

        const state = await tx.userQuestionState.findUnique({
          where: { userId_questionId: { userId, questionId: attempt.questionId } },
        })

        if (!existing) {
          if (state) {
            await tx.userQuestionState.update({
              where: { userId_questionId: { userId, questionId: attempt.questionId } },
              data: {
                answeredCount: { increment: 1 },
                correctCount: attempt.isCorrect ? { increment: 1 } : undefined,
                wrongCount: attempt.isCorrect ? undefined : { increment: 1 },
                lastAnswer: toJsonValue(attempt.answer),
                lastCorrect: attempt.isCorrect,
                lastAnsweredAt: new Date(attempt.createdAt),
                mastery:
                  state.answeredCount > 0
                    ? (state.correctCount + (attempt.isCorrect ? 1 : 0)) / (state.answeredCount + 1)
                    : attempt.isCorrect
                      ? 1
                      : 0,
              },
            })
          } else {
            await tx.userQuestionState.create({
              data: {
                userId,
                questionId: attempt.questionId,
                questionVersion: attempt.questionVersion,
                answeredCount: 1,
                correctCount: attempt.isCorrect ? 1 : 0,
                wrongCount: attempt.isCorrect ? 0 : 1,
                lastAnswer: toJsonValue(attempt.answer),
                lastCorrect: attempt.isCorrect,
                lastAnsweredAt: new Date(attempt.createdAt),
                mastery: attempt.isCorrect ? 1 : 0,
              },
            })
          }

          if (!attempt.isCorrect) {
            await tx.wrongQuestion.upsert({
              where: {
                userId_questionId: { userId, questionId: attempt.questionId },
              },
              create: {
                userId,
                questionId: attempt.questionId,
                wrongCount: 1,
                resolved: false,
              },
              update: {
                wrongCount: { increment: 1 },
                resolved: false,
              },
            })
          }
        }
      })
      synced++
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to sync attempt", error)
      }
      skipped++
    }
  }

  return { synced, skipped }
}
