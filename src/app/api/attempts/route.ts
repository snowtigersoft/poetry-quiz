import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { judgeAnswer } from "@/lib/judge"
import { Prisma, QuestionType } from "@prisma/client"

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}

export async function POST(request: NextRequest) {
  const session = await auth()
  const body = await request.json()
  const { questionId, answer, durationMs, anonymousId, localId } = body

  const question = await db.question.findUnique({
    where: { id: questionId },
  })

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }

  const { isCorrect } = judgeAnswer(question.type as QuestionType, answer, question.answer)

  const userId = session?.user?.id

  const attempt = await db.questionAttempt.create({
    data: {
      userId: userId ?? null,
      anonymousId: userId ? null : (anonymousId ?? null),
      localId: localId ?? null,
      questionId,
      questionVersion: question.version,
      answer: toJsonValue(answer),
      isCorrect,
      durationMs: durationMs ?? null,
    },
  })

  if (userId) {
    await db.$transaction(async (tx) => {
      const state = await tx.userQuestionState.findUnique({
        where: { userId_questionId: { userId, questionId } },
      })

      if (state) {
        const newAnsweredCount = state.answeredCount + 1
        const newCorrectCount = state.correctCount + (isCorrect ? 1 : 0)
        await tx.userQuestionState.update({
          where: { userId_questionId: { userId, questionId } },
          data: {
            answeredCount: { increment: 1 },
            correctCount: isCorrect ? { increment: 1 } : undefined,
            wrongCount: isCorrect ? undefined : { increment: 1 },
            lastAnswer: toJsonValue(answer),
            lastCorrect: isCorrect,
            lastAnsweredAt: new Date(),
            mastery: newCorrectCount / newAnsweredCount,
          },
        })
      } else {
        await tx.userQuestionState.create({
          data: {
            userId,
            questionId,
            questionVersion: question.version,
            answeredCount: 1,
            correctCount: isCorrect ? 1 : 0,
            wrongCount: isCorrect ? 0 : 1,
            lastAnswer: toJsonValue(answer),
            lastCorrect: isCorrect,
            lastAnsweredAt: new Date(),
            mastery: isCorrect ? 1 : 0,
          },
        })
      }

      if (!isCorrect) {
        await tx.wrongQuestion.upsert({
          where: { userId_questionId: { userId, questionId } },
          create: { userId, questionId, wrongCount: 1, resolved: false },
          update: { wrongCount: { increment: 1 }, resolved: false },
        })
      }
    })
  }

  return NextResponse.json({ isCorrect, attemptId: attempt.id })
}
