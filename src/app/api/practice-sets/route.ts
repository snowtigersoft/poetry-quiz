import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const grade = searchParams.get("grade")

  const practiceSets = await db.practiceSet.findMany({
    where: {
      isPublic: true,
      ...(grade ? { grade: parseInt(grade) } : {}),
    },
    include: {
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ practiceSets })
}
