import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { QuestionStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const grade = searchParams.get("grade")
  const type = searchParams.get("type")
  const difficulty = searchParams.get("difficulty")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const skip = (page - 1) * limit

  const where = {
    status: QuestionStatus.PUBLISHED,
    ...(grade ? { grade: parseInt(grade) } : {}),
    ...(type ? { type: type as never } : {}),
    ...(difficulty ? { difficulty: parseInt(difficulty) } : {}),
  }

  const [questions, total] = await Promise.all([
    db.question.findMany({
      where,
      include: {
        options: { orderBy: { sortOrder: "asc" } },
        tags: { include: { tag: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.question.count({ where }),
  ])

  return NextResponse.json({ questions, total, page, limit })
}
