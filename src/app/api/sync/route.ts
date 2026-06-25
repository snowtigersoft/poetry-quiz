import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { syncLocalAttempts } from "@/lib/sync"
import { LocalAttempt } from "@/types/progress"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { attempts } = body as { attempts: LocalAttempt[] }

  if (!Array.isArray(attempts)) {
    return NextResponse.json({ error: "attempts must be an array" }, { status: 400 })
  }

  const result = await syncLocalAttempts(session.user.id, attempts)

  return NextResponse.json(result)
}
