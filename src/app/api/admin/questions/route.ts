import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Prisma, UserRole, QuestionType, QuestionStatus } from "@prisma/client"

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== UserRole.ADMIN) return null
  return user
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const skip = (page - 1) * limit
  const status = searchParams.get("status") as QuestionStatus | null

  const [questions, total] = await Promise.all([
    db.question.findMany({
      where: status ? { status } : undefined,
      include: {
        options: { orderBy: { sortOrder: "asc" } },
        tags: { include: { tag: true } },
        _count: { select: { attempts: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.question.count({ where: status ? { status } : undefined }),
  ])

  return NextResponse.json({ questions, total, page, limit })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const { type, stem, answer, explanation, source, grade, difficulty, options } = body

  const question = await db.$transaction(async (tx) => {
    const q = await tx.question.create({
      data: {
        type: type as QuestionType,
        stem,
        answer: toJsonValue(answer),
        explanation,
        source,
        grade,
        difficulty: difficulty ?? 1,
        status: QuestionStatus.PUBLISHED,
      },
    })

    if (options?.length) {
      await tx.questionOption.createMany({
        data: options.map((opt: { label: string; content: string }, idx: number) => ({
          questionId: q.id,
          label: opt.label,
          content: opt.content,
          sortOrder: idx,
        })),
      })
    }

    return q
  })

  return NextResponse.json(question, { status: 201 })
}
