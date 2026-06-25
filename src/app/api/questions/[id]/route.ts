import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const question = await db.question.findUnique({
    where: { id },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      tags: { include: { tag: true } },
    },
  })

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }

  return NextResponse.json(question)
}
