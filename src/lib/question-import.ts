import { db } from "@/lib/db"
import { Prisma, QuestionType, QuestionStatus, TagType } from "@prisma/client"

export type ImportQuestion = {
  type: string
  stem: string
  options?: Array<{ label: string; content: string }>
  answer: unknown
  explanation?: string
  source?: string
  grade?: number
  difficulty?: number
  tags?: string[]
}

export type ImportResult = {
  success: number
  errors: Array<{ index: number; error: string }>
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}

function validateQuestion(q: ImportQuestion, index: number): string | null {
  if (!q.stem?.trim()) return `Question ${index}: stem is required`
  if (!q.type || !Object.values(QuestionType).includes(q.type as QuestionType)) {
    return `Question ${index}: invalid type "${q.type}"`
  }
  if (
    (q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") &&
    (!q.options || q.options.length === 0)
  ) {
    return `Question ${index}: options required for choice questions`
  }
  if (q.answer === undefined || q.answer === null) {
    return `Question ${index}: answer is required`
  }
  if (q.difficulty !== undefined && (q.difficulty < 1 || q.difficulty > 5)) {
    return `Question ${index}: difficulty must be 1-5`
  }
  return null
}

export async function importQuestions(questions: ImportQuestion[]): Promise<ImportResult> {
  const result: ImportResult = { success: 0, errors: [] }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const error = validateQuestion(q, i + 1)
    if (error) {
      result.errors.push({ index: i, error })
      continue
    }

    try {
      await db.$transaction(async (tx) => {
        const question = await tx.question.create({
          data: {
            type: q.type as QuestionType,
            stem: q.stem,
            answer: toJsonValue(q.answer),
            explanation: q.explanation,
            source: q.source,
            grade: q.grade,
            difficulty: q.difficulty ?? 1,
            status: QuestionStatus.PUBLISHED,
          },
        })

        if (q.options && q.options.length > 0) {
          await tx.questionOption.createMany({
            data: q.options.map((opt, idx) => ({
              questionId: question.id,
              label: opt.label,
              content: opt.content,
              sortOrder: idx,
            })),
          })
        }

        if (q.tags && q.tags.length > 0) {
          for (const tagName of q.tags) {
            const tag = await tx.tag.upsert({
              where: { name_type: { name: tagName, type: TagType.THEME } },
              create: { name: tagName, type: TagType.THEME },
              update: {},
            })
            await tx.questionTag.create({
              data: { questionId: question.id, tagId: tag.id },
            })
          }
        }
      })
      result.success++
    } catch (err) {
      result.errors.push({ index: i, error: String(err) })
    }
  }

  return result
}
