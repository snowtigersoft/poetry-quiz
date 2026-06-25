import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import { importQuestions } from "@/lib/question-import"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== UserRole.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const contentType = request.headers.get("content-type") ?? ""
  let questions

  if (contentType.includes("application/json")) {
    const body = await request.json()
    questions = Array.isArray(body) ? body : body.questions
  } else {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 })
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "No questions provided" }, { status: 400 })
  }

  if (questions.length > 1000) {
    return NextResponse.json({ error: "Maximum 1000 questions per import" }, { status: 400 })
  }

  const result = await importQuestions(questions)
  return NextResponse.json(result)
}
