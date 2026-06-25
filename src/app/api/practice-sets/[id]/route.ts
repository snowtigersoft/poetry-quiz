import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { QuestionStatus } from "@prisma/client"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const practiceSet = await db.practiceSet.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        include: {
          question: {
            include: {
              options: { orderBy: { sortOrder: "asc" } },
              tags: { include: { tag: true } },
            },
          },
        },
        where: {
          question: { status: QuestionStatus.PUBLISHED },
        },
      },
    },
  })

  if (!practiceSet) {
    return NextResponse.json({ error: "Practice set not found" }, { status: 404 })
  }

  return NextResponse.json(practiceSet)
}
