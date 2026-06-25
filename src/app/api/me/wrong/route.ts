import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const skip = (page - 1) * limit

  const [wrongQuestions, total] = await Promise.all([
    db.wrongQuestion.findMany({
      where: { userId: session.user.id, resolved: false },
      include: {
        question: {
          include: {
            options: { orderBy: { sortOrder: "asc" } },
            tags: { include: { tag: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    db.wrongQuestion.count({ where: { userId: session.user.id, resolved: false } }),
  ])

  return NextResponse.json({ wrongQuestions, total, page, limit })
}
